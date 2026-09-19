import test from 'node:test';
import assert from 'node:assert/strict';
import { session, favorite, requestMeeting, applicationSchema } from './store';
test('セッションは分離され、未知のセッションIDは採用されない',()=>{const a=session('untrusted-id');const b=session();assert.notEqual(a.id,'untrusted-id');favorite(a.account,'m1');assert.deepEqual(b.account.favorites,[]);assert.equal(session(a.id).account,a.account)});
test('お気に入りはトグルでき、架空のIDは拒否する',()=>{const {account}=session();favorite(account,'m1');favorite(account,'m1');assert.deepEqual(account.favorites,[]);assert.throws(()=>favorite(account,'missing'))});
test('申請前は面談希望を拒否し、申請後は重複登録しない',()=>{const {account}=session();assert.throws(()=>requestMeeting(account,'m1'));account.status='pending';requestMeeting(account,'m1');requestMeeting(account,'m1');assert.deepEqual(account.requests,['m1']);assert.throws(()=>requestMeeting(account,'missing'))});
test('年齢、価値観、同意をサーバーで検証する',()=>{const data={name:'はる',age:30,location:'東京都',values:['家族との時間'],consent:true};assert.equal(applicationSchema.safeParse(data).success,true);for(const patch of [{age:19},{values:[]},{values:['unknown']},{consent:false},{name:' '}])assert.equal(applicationSchema.safeParse({...data,...patch}).success,false)});
test('期限切れのセッションは再利用されない',()=>{const {id,account}=session();account.expires=Date.now()-1;assert.notEqual(session(id).id,id)});
test('男性会員にも既存と同じ保存・面談希望の制約を適用する',()=>{const {account}=session();favorite(account,'m7');assert.deepEqual(account.favorites,['m7']);assert.throws(()=>requestMeeting(account,'m7'));account.status='pending';requestMeeting(account,'m7');requestMeeting(account,'m7');assert.deepEqual(account.requests,['m7']);favorite(account,'m1');assert.deepEqual(account.favorites,['m7','m1']);favorite(account,'m7');assert.deepEqual(account.favorites,['m1'])});
