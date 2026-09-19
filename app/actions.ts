'use server';
import { cookies } from 'next/headers';
import { applicationSchema, favorite, requestMeeting, session } from '@/lib/store';
async function current(){const jar=await cookies(); const result=session(jar.get('towari_session')?.value); jar.set('towari_session',result.id,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:86400}); return result.account;}
export async function bootstrap(){return {...await current()};}
export async function toggleFavorite(id:string){const account=await current(); favorite(account,id); return {...account};}
export async function applyForMembership(input:unknown){const parsed=applicationSchema.safeParse(input); if(!parsed.success)return {error:parsed.error.issues[0].message}; const account=await current(); if(account.status==='pending')return {error:'入会申請は受付済みです。'}; Object.assign(account,{name:parsed.data.name,age:parsed.data.age,location:parsed.data.location,values:parsed.data.values,status:'pending'}); return {account:{...account}};}
export async function saveMeeting(id:string){const account=await current();try{requestMeeting(account,id);return {account:{...account}};}catch(error){return {error:error instanceof Error?error.message:'登録できませんでした'};}}
