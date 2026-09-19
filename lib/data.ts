export type Member = {
  id: string;
  gender: "woman" | "man";
  name: string;
  age: number;
  location: string;
  job: string;
  photo: string;
  position?: string;
  values: string[];
  intro: string;
  story: string;
  hobbies: string[];
};
export const members: Member[] = [
  {
    gender: "woman",
    id: "m1",
    name: "美咲",
    age: 29,
    location: "東京都",
    job: "広報・PR",
    photo: "/portraits/misaki.png",
    values: ["何気ない日常を大切に", "お互いを尊重したい"],
    intro: "日々の小さな幸せを、ふたりで。",
    story:
      "休日は気になるカフェを訪ねたり、緑のある場所を散歩したり。うれしかったことも、少し疲れた日も、自然に話し合える関係を育てていきたいです。",
    hobbies: ["カフェ巡り", "散歩", "料理"],
  },
  {
    gender: "woman",
    id: "m2",
    name: "彩乃",
    age: 31,
    location: "神奈川県",
    job: "建築・インテリア",
    photo: "/portraits/ayano.png",
    values: ["家族との時間", "穏やかな暮らし"],
    intro: "心地よい暮らしを、一緒につくりたい。",
    story:
      "住まいに関わる仕事をしています。休日には本を読んだり、季節の食材で料理をするのが好きです。お互いのひとりの時間も大切にできたらと思っています。",
    hobbies: ["建築", "読書", "美術館"],
  },
  {
    gender: "woman",
    id: "m3",
    name: "結衣",
    age: 28,
    location: "東京都",
    job: "企画・マーケティング",
    photo: "/portraits/yui.png",
    values: ["一緒に新しい体験を", "対話を大切に"],
    intro: "まだ知らない景色を、あなたと。",
    story:
      "旅と写真が好きです。ふたりの違いを楽しみながら、何年経ってもお互いに好奇心を持っていられる関係が理想です。",
    hobbies: ["旅行", "写真", "映画"],
  },
  {
    gender: "woman",
    id: "m4",
    name: "沙織",
    age: 32,
    location: "千葉県",
    job: "教育・研究",
    photo: "/portraits/saori.png",
    values: ["お互いを尊重したい", "家族との時間"],
    intro: "たくさん話して、たくさん笑う毎日を。",
    story:
      "教育に携わっています。週末はパンを焼いたり、友人と食事に出かけたり。素直な気持ちを言葉にして、支え合っていきたいです。",
    hobbies: ["パン作り", "音楽", "自然"],
  },
  {
    gender: "woman",
    id: "m5",
    name: "遥",
    age: 30,
    location: "埼玉県",
    job: "IT・デザイン",
    photo: "/portraits/haruka.png",
    values: ["穏やかな暮らし", "対話を大切に"],
    intro: "ありのままの自分で、いられる場所。",
    story:
      "デザインの仕事をしています。無理をせず、お互いのペースを大切にできる方と出会えたらうれしいです。",
    hobbies: ["デザイン", "喫茶店", "読書"],
  },
  {
    gender: "woman",
    id: "m6",
    name: "奈央",
    age: 29,
    location: "東京都",
    job: "医療・福祉",
    photo: "/portraits/nao.png",
    values: ["何気ない日常を大切に", "一緒に新しい体験を"],
    intro: "「おかえり」が、楽しみになる関係に。",
    story:
      "忙しい毎日の中でも一緒にごはんを食べる時間を大切にしたいです。休日は自然の中でリフレッシュしています。",
    hobbies: ["ハイキング", "料理", "旅行"],
  },
  {
    gender: "man",
    id: "m7",
    name: "拓海",
    age: 32,
    location: "東京都",
    job: "IT・エンジニア",
    photo: "/portraits/takumi.png",
    values: ["何気ない日常を大切に", "お互いを尊重したい"],
    intro: "何でも話せる、いちばんの味方に。",
    story:
      "ものづくりに関わる仕事をしています。休日は近所を散歩したり、新しいレシピに挑戦したり。家事も日々の決断もふたりで相談しながら、お互いが心地よくいられる暮らしをつくりたいです。",
    hobbies: ["料理", "散歩", "映画"],
  },
  {
    gender: "man",
    id: "m8",
    name: "直樹",
    age: 34,
    location: "神奈川県",
    job: "建築・設計",
    photo: "/portraits/naoki.png",
    values: ["家族との時間", "穏やかな暮らし"],
    intro: "帰るのが楽しみになる、ふたりの家を。",
    story:
      "住宅の設計をしています。休日は美術館や古い街並みを訪ねるのが好きです。仕事も家族との時間も大切にしながら、何気ない日常を一緒に楽しめる関係が理想です。",
    hobbies: ["建築", "美術館", "コーヒー"],
  },
  {
    gender: "man",
    id: "m9",
    name: "悠人",
    age: 30,
    location: "東京都",
    job: "企画・マーケティング",
    photo: "/portraits/yuto.png",
    values: ["一緒に新しい体験を", "対話を大切に"],
    intro: "同じ景色を見て、違う感想を楽しもう。",
    story:
      "週末に小旅行へ出かけたり、気になるお店を開拓したりしています。意見が違うときも、まずは相手の話を聞きたい。ふたりで話し合いながら、これからの人生を考えていきたいです。",
    hobbies: ["旅行", "写真", "食べ歩き"],
  },
  {
    gender: "man",
    id: "m10",
    name: "健太",
    age: 33,
    location: "千葉県",
    job: "教育・研究",
    photo: "/portraits/kenta.png",
    values: ["お互いを尊重したい", "家族との時間"],
    intro: "お互いの「好き」を、大切にできる人と。",
    story:
      "教育に関わる仕事をしています。本を読んだり、友人とボードゲームをする時間が好きです。ひとりの時間も一緒の時間も大切にして、安心して気持ちを伝え合える家庭を築きたいです。",
    hobbies: ["読書", "ボードゲーム", "音楽"],
  },
  {
    gender: "man",
    id: "m11",
    name: "亮介",
    age: 35,
    location: "埼玉県",
    job: "プロダクトデザイン",
    photo: "/portraits/ryosuke.png",
    values: ["穏やかな暮らし", "対話を大切に"],
    intro: "肩の力を抜いて、ずっと隣に。",
    story:
      "暮らしに関わる製品のデザインをしています。休日は喫茶店でゆっくりしたり、季節の野菜で料理をしたり。背伸びをせず、お互いを思いやる小さな行動を積み重ねていきたいです。",
    hobbies: ["デザイン", "喫茶店", "料理"],
  },
  {
    gender: "man",
    id: "m12",
    name: "颯太",
    age: 29,
    location: "東京都",
    job: "医療・リハビリ",
    photo: "/portraits/sota.png",
    values: ["何気ない日常を大切に", "一緒に新しい体験を"],
    intro: "うれしいことを、最初に伝えたい人に。",
    story:
      "リハビリに携わる仕事をしています。自然の中を歩くことや、家で映画を観ることが好きです。忙しいときこそ声をかけ合って、ふたりで支え合える関係を育てていけたらうれしいです。",
    hobbies: ["ハイキング", "映画", "料理"],
  },
];
export const valueOptions = [
  "何気ない日常を大切に",
  "お互いを尊重したい",
  "家族との時間",
  "穏やかな暮らし",
  "一緒に新しい体験を",
  "対話を大切に",
];
