import Dashboard from './dashboard';
import {members} from '@/lib/data';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{view?:string|string[]}>}){
  const view=(await searchParams).view==='men'?'men':'women';
  const gender=view==='men'?'man':'woman';
  return <Dashboard key={view} view={view} members={members.filter(member=>member.gender===gender)}/>;
}
