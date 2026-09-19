import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { members, valueOptions } from './data';
export type Account = {name:string;age:number;location:string;values:string[];status:'guest'|'pending';favorites:string[];requests:string[];expires:number};
const globalStore = globalThis as unknown as {towariStore?:Map<string,Account>};
const accounts = globalStore.towariStore ??= new Map<string,Account>();
export function session(id?:string) { const now=Date.now(); for(const [key,value] of accounts) if(value.expires < now) accounts.delete(key); if(id && accounts.has(id)) return {id,account:accounts.get(id)!}; const key=randomUUID(); const account:Account={name:'ゲスト',age:30,location:'東京都',values:['何気ない日常を大切に','お互いを尊重したい'],status:'guest',favorites:[],requests:[],expires:now+86400000}; accounts.set(key,account); return {id:key,account}; }
export const applicationSchema=z.object({name:z.string().trim().min(1,'お名前を入力してください').max(30),age:z.coerce.number().int().min(20,'20歳以上の方を対象としています').max(100),location:z.enum(['東京都','神奈川県','千葉県','埼玉県','その他']),values:z.array(z.string().refine(v=>valueOptions.includes(v))).min(1,'価値観を1つ以上選んでください').max(3),consent:z.literal(true)});
export function favorite(account:Account,id:string){if(!members.some(m=>m.id===id)) throw new Error('会員が見つかりません'); account.favorites=account.favorites.includes(id)?account.favorites.filter(x=>x!==id):[...account.favorites,id];}
export function requestMeeting(account:Account,id:string){if(!members.some(m=>m.id===id)) throw new Error('会員が見つかりません'); if(account.status==='guest') throw new Error('面談希望の登録には、まず入会申請をお願いします。'); if(!account.requests.includes(id)) account.requests.push(id);}
