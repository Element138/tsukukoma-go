"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import type { Location } from "@/app/page";
import { useSearchParams } from "next/navigation";

const LOCATIONS: Location[] = [
  {
    id: "m",
    locid: "m",
    name: "最寄りの男子トイレ",
    category: "男子トイレ自動選択",
    organizer: "",
    position: "オレンジ館・ブルー館・レッド館に限る",
    keywords: ["もよりのだんしといれ"],
  },
  {
    id: "f",
    locid: "f",
    name: "最寄りの女子トイレ",
    category: "女子トイレ自動選択",
    organizer: "",
    position: "オレンジ館・ブルー館・レッド館に限る",
    keywords: ["もよりのじょしといれ"],
  },
  {
    id: "58",
    locid: "123",
    name: "受付 (正門前)",
    category: "その他",
    organizer: "",
    position: "屋外",
    keywords: [
      "うけつけせいもんまえ",
      "パンフレット",
      "ロータリー",
      "ろーたりー",
    ],
  },
  {
    id: "1",
    locid: "149",
    name: "総合案内所 (通常)",
    category: "その他",
    organizer: "",
    position: "屋外 (中庭)",
    keywords: ["そうごうあんないじょせいてんじ", "インフォメーション"],
  },
  {
    id: "2",
    locid: "138",
    name: "総合案内所 (雨天時)",
    category: "その他",
    organizer: "",
    position: "レッド館東付近1F",
    keywords: ["そうごうあんないじょうてんじ", "インフォメーション"],
  },
  {
    id: "91",
    locid: "169",
    name: "グラウンド",
    category: "避難所",
    organizer: "",
    position: "屋外",
    keywords: [
      "ぐらうんど",
      "校庭",
      "こうてい",
      "グランド",
      "避難所",
      "ひなんじょ",
    ],
  },
  {
    id: "56",
    locid: "122",
    name: "正門 (入口)",
    category: "その他",
    organizer: "",
    position: "屋外",
    keywords: [
      "いりぐち",
      "ゲート",
      "正門",
      "せいもん",
      "ロータリー",
      "ろーたりー",
    ],
  },
  {
    id: "57",
    locid: "124",
    name: "正門 (出口)",
    category: "その他",
    organizer: "",
    position: "屋外",
    keywords: [
      "でぐち",
      "ゲート",
      "正門",
      "大衆賞投票所",
      "せいもん",
      "ロータリー",
      "ろーたりー",
    ],
  },
  {
    id: "3",
    locid: "114",
    name: "保健室",
    category: "その他",
    organizer: "",
    position: "レッド館1F",
    keywords: ["ほけんしつ"],
  },
  {
    id: "4",
    locid: "164",
    name: "藤棚休憩所",
    category: "その他",
    organizer: "",
    position: "屋外",
    keywords: ["ふじだなきゅうけいじょ"],
  },
  {
    id: "5",
    locid: "154",
    name: "縁日班",
    category: "高3",
    organizer: "高3縁日",
    position: "屋外 (ピロティ)",
    keywords: [
      "えんにちはん",
      "トニカクエンニチ",
      "とにかくえんにち",
      "縁日班",
      "アトラクション",
      "駄菓子",
      "ポップコーン",
      "中古市",
      "がらくた",
      "ガラクタ",
      "やぐら",
      "シューティング",
      "音ゲー",
      "エアホッケー",
      "格ゲー",
      "カードゲーム",
      "景品交換所",
      "じゃんけんまん",
      "ジャンケンマン",
      "じゃんけんマン",
      "くじ",
      "福袋",
    ],
  },
  {
    id: "6",
    locid: "155",
    name: "チケットブース",
    category: "高3",
    organizer: "高3縁日・食品",
    position: "屋外 (ピロティ)",
    keywords: ["ちけっとぶーす", "縁日班", "食品班", "チケット販売所"],
  },
  {
    id: "7",
    locid: "131",
    name: "ステージ班",
    category: "高3",
    organizer: "高3ステージ",
    position: "屋外 (中庭)",
    keywords: [
      "すてーじはん",
      "大喝祭",
      "だいかっさい",
      "学年対抗戦",
      "vs教員",
      "バリ体張り",
      "部活対抗戦",
      "筑駒生クイズ何問目？",
      "コロシアム",
      "esports",
      "e-sports",
      "笑わしあむ",
      "演駒",
      "筑駒生格付けチェック",
      "TSUKU ROCK",
      "つくロック",
      "ツクロック",
      "ややミスター筑駒",
      "Mr.筑駒",
      "ミスター筑駒",
      "バカ討論",
      "こころしあむ",
      "筑駒vs開成",
      "DANCE FES",
      "ダンスフェス",
      "My Sweet 筑駒",
      "マイスイート筑駒",
      "マイスウィート筑駒",
      "ミス筑駒",
      "PERFORMANCE FINAL",
      "STAGE FINAL",
      "パフォーマンスファイナル",
      "ステージファイナル",
    ],
  },
  {
    id: "8",
    locid: "106",
    name: "コント班 (会場)",
    category: "高3",
    organizer: "高3コント",
    position: "7号館3F",
    keywords: [
      "こんとはんかいじょう",
      "Upside Down",
      "あっぷさいどだうん",
      "アップサイドダウン",
      "漫才",
      "アトラス",
      "マッターホルン",
      "ロッキー",
      "キリマンジャロ",
      "エベレスト",
    ],
  },
  {
    id: "89",
    locid: "167",
    name: "コント班 (整理券あり集合場所)",
    category: "高3",
    organizer: "高3コント",
    position: "屋外",
    keywords: [
      "こんとはんせいりけんありしゅうごうばしょ",
      "Upside Down",
      "あっぷさいどだうん",
      "アップサイドダウン",
      "漫才",
      "アトラス",
      "マッターホルン",
      "ロッキー",
      "キリマンジャロ",
      "エベレスト",
    ],
  },
  {
    id: "90",
    locid: "168",
    name: "コント班 (整理券なし集合場所)",
    category: "高3",
    organizer: "高3コント",
    position: "屋外",
    keywords: [
      "こんとはんせいりけんなししゅうごうばしょ",
      "Upside Down",
      "あっぷさいどだうん",
      "アップサイドダウン",
      "漫才",
      "アトラス",
      "マッターホルン",
      "ロッキー",
      "キリマンジャロ",
      "エベレスト",
    ],
  },
  {
    id: "9",
    locid: "162",
    name: "食品班 (朝日の広場)",
    category: "高3",
    organizer: "高3食品",
    position: "屋外",
    keywords: [
      "しょくひんはんあさひのひろば",
      "つむぎ",
      "つくこまぜそば",
      "筑駒咖哩飯",
      "筑駒カレー飯",
      "野菜たっぷりミネストローネ",
      "いもだんご",
      "芋団子",
      "タピオカミルクティー",
    ],
  },
  {
    id: "10",
    locid: "163",
    name: "食品班 (中庭)",
    category: "高3",
    organizer: "高3食品",
    position: "屋外 (中庭)",
    keywords: ["しょくひんはんなかにわ", "タピオカミルクティー"],
  },
  {
    id: "11",
    locid: "108",
    name: "喫茶班",
    category: "高3",
    organizer: "高3喫茶",
    position: "50周年記念会館",
    keywords: [
      "きっさはん",
      "ひねもす",
      "終日",
      "カフェ",
      "スイーツ",
      "ドリンク",
      "クロックムッシュ",
      "小倉トースト",
      "コンソメスープ",
      "ベリーパフェ",
      "抹茶パフェ",
      "チョコクロワッサン",
      "ドリップコーヒー",
      "アイスコーヒー",
      "紅茶",
      "クラフトコーラ",
      "リンゴジュース",
    ],
  },
  {
    id: "12",
    locid: "130",
    name: "お土産 (中庭売り場)",
    category: "高3",
    organizer: "高3お土産",
    position: "屋外 (中庭)",
    keywords: [
      "おみやげなかにわうりば",
      "筑駒カレー",
      "クッキー",
      "トートバッグ",
      "カレンダー",
      "フェイスタオル3種",
      "クリアファイル3種",
      "ステッカー3種",
    ],
  },
  {
    id: "13",
    locid: "108",
    name: "お土産 (50周年売り場)",
    category: "高3",
    organizer: "高3お土産",
    position: "50周年記念会館",
    keywords: [
      "おみやげ50しゅうねんうりば",
      "筑駒カレー",
      "クッキー",
      "トートバッグ",
      "カレンダー",
      "フェイスタオル3種",
      "クリアファイル3種",
      "ステッカー3種",
    ],
  },
  {
    id: "14",
    locid: "119",
    name: "筑駒大解剖",
    category: "展示",
    organizer: "1-A HR",
    position: "オレンジ館3F",
    keywords: ["1A", "1年A組", "つくこまだいかいぼう", "ジオラマ"],
  },
  {
    id: "15",
    locid: "120",
    name: "立方体のキセキ",
    category: "展示",
    organizer: "1-B HR",
    position: "オレンジ館3F",
    keywords: ["1B", "1年B組", "りっぽうたいのきせき", "ルービックキューブ"],
  },
  {
    id: "16",
    locid: "121",
    name: "ピタゴラ×science",
    category: "展示",
    organizer: "1-C HR",
    position: "オレンジ館3F",
    keywords: [
      "1C",
      "1年C組",
      "ぴたごらさいえんす",
      "ピタゴラサイエンス",
      "ピタゴラ装置",
      "ピタゴラスイッチ",
    ],
  },
  {
    id: "17",
    locid: "141",
    name: "錯。",
    category: "展示",
    organizer: "2-A HR",
    position: "オレンジ館2F",
    keywords: ["2A", "2年A組", "さく。", "錯覚"],
  },
  {
    id: "18",
    locid: "142",
    name: "Freedom on boards －盤上の自由－",
    category: "体験",
    organizer: "2-B HR",
    position: "オレンジ館2F",
    keywords: [
      "2B",
      "2年B組",
      "ふりーだむおんぼーず ばんじょうのじゆう",
      "ボードゲーム",
    ],
  },
  {
    id: "19",
    locid: "143",
    name: "呪いの王墓 (ピラミッド)",
    category: "体験",
    organizer: "2-C HR",
    position: "オレンジ館2F",
    keywords: [
      "2C",
      "2年C組",
      "のろいのおうぼ",
      "のろいのぴらみっど",
      "のろいのピラミッド",
      "謎解き脱出ゲーム",
    ],
  },
  {
    id: "20",
    locid: "152",
    name: "#LOCKED FESTIVAL",
    category: "体験",
    organizer: "3-A HR",
    position: "オレンジ館1F",
    keywords: [
      "3A",
      "3年A組",
      "#ろっくどふぇすてぃばる",
      "#ロックドフェスティバル",
      "脱出ゲーム",
    ],
  },
  {
    id: "21",
    locid: "153",
    name: "SAMPLE No.X",
    category: "体験",
    organizer: "3-B HR",
    position: "オレンジ館1F",
    keywords: [
      "3B",
      "3年B組",
      "さんぷるなんばーえっくす",
      "サンプルナンバーエックス",
      "謎解き",
    ],
  },
  {
    id: "22",
    locid: "148",
    name: "江戸べがす",
    category: "体験",
    organizer: "3-C HR",
    position: "オレンジ館1F",
    keywords: ["3C", "3年C組", "えどべがす", "丁半"],
  },
  {
    id: "23",
    locid: "134",
    name: "中高将棋部",
    category: "体験",
    organizer: "中高将棋部",
    position: "ブルー館3F",
    keywords: ["ちゅうこうしょうぎぶ"],
  },
  {
    id: "24",
    locid: "135",
    name: "ポケットからサメが吹き出す",
    category: "演劇",
    organizer: "中高演劇部",
    position: "ブルー館3F",
    keywords: ["ぽけっとからさめがふきだす"],
  },
  {
    id: "25",
    locid: "133",
    name: "陽炎、夕立、温い夏風",
    category: "展示",
    organizer: "高2展示",
    position: "ブルー館3F",
    keywords: [
      "2-1",
      "2-2",
      "2-3",
      "2-4",
      "2年1組",
      "2年2組",
      "2年3組",
      "2年4組",
      "かげろうゆうだちぬるいなつかぜ",
      "夏祭り",
    ],
  },
  {
    id: "26",
    locid: "127",
    name: "天つ刻",
    category: "体験",
    organizer: "高2謎解き",
    position: "ブルー館2F",
    keywords: [
      "2-1",
      "2-2",
      "2-3",
      "2-4",
      "2年1組",
      "2年2組",
      "2年3組",
      "2年4組",
      "あまつとき",
      "あまつどき",
      "てんつとき",
      "てんつどき",
      "あまつこく",
      "てんつこく",
      "謎解き",
    ],
  },
  {
    id: "27",
    locid: "128",
    name: "天国だろうが金は要る",
    category: "体験",
    organizer: "高2カジノ",
    position: "ブルー館2F",
    keywords: [
      "2-1",
      "2-2",
      "2-3",
      "2-4",
      "2年1組",
      "2年2組",
      "2年3組",
      "2年4組",
      "てんごくだろうがかねはいる",
    ],
  },
  {
    id: "28",
    locid: "132",
    name: "おバカ屋敷 the movie",
    category: "映画",
    organizer: "高2映画",
    position: "ブルー館3F",
    keywords: [
      "2-1",
      "2-2",
      "2-3",
      "2-4",
      "2年1組",
      "2年2組",
      "2年3組",
      "2年4組",
      "おばかやしきざむーびー",
      "ホラー",
      "コメディ",
    ],
  },
  {
    id: "29",
    locid: "145",
    name: "置き碁は恥だが役に立つ",
    category: "体験",
    organizer: "駒場棋院",
    position: "ブルー館2F",
    keywords: ["おきごははじだがやくにたつ", "囲碁"],
  },
  {
    id: "30",
    locid: "144",
    name: "そしてあなたもいなくなる",
    category: "体験",
    organizer: "1-1 HR",
    position: "ブルー館2F",
    keywords: ["1年1組"],
  },
  {
    id: "31",
    locid: "157",
    name: "地獄の沙汰も賭け次第",
    category: "体験",
    organizer: "1-2 HR",
    position: "ブルー館1F",
    keywords: ["1年2組", "じごくのさたもかけしだい", "カジノ"],
  },
  {
    id: "32",
    locid: "160",
    name: "忍の試練",
    category: "体験",
    organizer: "1-3 HR",
    position: "ブルー館1F",
    keywords: ["1年3組", "しのびのしれん", "忍びの試練"],
  },
  {
    id: "33",
    locid: "161",
    name: "Order Restoration Institute",
    category: "体験",
    organizer: "1-4 HR",
    position: "ブルー館1F",
    keywords: [
      "1年4組",
      "おーだーれすとれーしょんいんすてぃちゅーと",
      "オーダーレストレーションインスティチュート",
      "ORI",
    ],
  },
  {
    id: "34",
    locid: "102",
    name: "Lux aeterna",
    category: "パフォーマンス",
    organizer: "アンサンブル同好会",
    position: "レッド館3F",
    keywords: ["るくすえてるな", "ルクスエテルナ", "音楽室"],
  },
  {
    id: "35",
    locid: "102",
    name: "煌",
    category: "パフォーマンス",
    organizer: "ピアノ同好会",
    position: "レッド館3F",
    keywords: ["きらめき", "こう", "あき", "かがやき", "音楽室"],
  },
  {
    id: "36",
    locid: "103",
    name: "マッドマートからの脱出",
    category: "体験",
    organizer: "中高アナログゲーム同好会",
    position: "レッド館3F",
    keywords: ["まっどまーとからのだっしゅつ", "物理講義室"],
  },
  {
    id: "37",
    locid: "166",
    name: "ボドゲカフェ",
    category: "体験",
    organizer: "中高アナログゲーム同好会",
    position: "レッド館3F",
    keywords: [
      "ぼどげかふぇ",
      "ボードゲームカフェ",
      "TRPG",
      "特別活動室",
      "特活",
    ],
  },
  {
    id: "38",
    locid: "166",
    name: "数学科展示",
    category: "展示 (特別)",
    organizer: "数学科",
    position: "レッド館3F",
    keywords: ["すうがくかてんじ", "76期テーマ学習", "特別活動室", "特活"],
  },
  {
    id: "39",
    locid: "104",
    name: "折音 -ORION- ",
    category: "展示",
    organizer: "折り紙研究会",
    position: "レッド館3F",
    keywords: ["おりおん", "折り研", "おりけん", "物理実験室"],
  },
  {
    id: "40",
    locid: "105",
    name: "企画展示「キテン」",
    category: "展示",
    organizer: "筑駒総合美術研究会",
    position: "レッド館2F",
    keywords: ["きかくてんじきてん", "CG研究会", "筑駒総美研", "美術室奥"],
  },
  {
    id: "41",
    locid: "165",
    name: "ひかりとかげの新幹線 (場所1)",
    category: "体験",
    organizer: "鉄道研究部",
    position: "レッド館2F",
    keywords: [
      "ひかりとかげのしんかんせん",
      "鉄研",
      "てっけん",
      "ジオラマ",
      "地理室",
    ],
  },
  {
    id: "42",
    locid: "129",
    name: "ひかりとかげの新幹線 (場所2)",
    category: "体験",
    organizer: "鉄道研究部",
    position: "渡り廊下M3F",
    keywords: [
      "ひかりとかげのしんかんせん",
      "鉄研",
      "てっけん",
      "ジオラマ",
      "コモンスペース",
      "コモスペ",
    ],
  },
  {
    id: "43",
    locid: "107",
    name: "稲実る湖畔に生きる",
    category: "展示",
    organizer: "地域振興研究会",
    position: "レッド館2F",
    keywords: ["いねみのるこはんにいきる", "振興研", "立体模型", "地理室"],
  },
  {
    id: "44",
    locid: "110",
    name: "𰻞字路",
    category: "展示",
    organizer: "中高文藝部",
    position: "レッド館2F",
    keywords: ["びゃんじろ", "中高文芸部", "地学室"],
  },
  {
    id: "45",
    locid: "110",
    name: "農ある部活は爪を隠す",
    category: "体験",
    organizer: "中高農芸部",
    position: "レッド館2F",
    keywords: ["のうあるぶかつはつめをかくす", "畑ツアー", "地学室"],
  },
  {
    id: "46",
    locid: "111",
    name: "TKQS FOR LIFE",
    category: "体験",
    organizer: "中高クイズ研究会",
    position: "レッド館2F",
    keywords: ["クイ研", "くいけん", "早押しクイズ", "生物講義室"],
  },
  {
    id: "47",
    locid: "112",
    name: "いきものわーるど2025",
    category: "展示",
    organizer: "中高生物部",
    position: "レッド館2F",
    keywords: ["いきものわーるど２０２５", "生き物ワールド2025", "生物実験室"],
  },
  {
    id: "48",
    locid: "113",
    name: "FLUX",
    category: "展示",
    organizer: "パーソナルコンピューター研究部",
    position: "レッド館1F",
    keywords: [
      "ふらっくす",
      "フラックス",
      "パ研",
      "ぱけん",
      "パソ研",
      "ぱそけん",
      "PAKEN",
      "技術室奥",
    ],
  },
  {
    id: "49",
    locid: "117",
    name: "パズル砦",
    category: "展示",
    organizer: "パズル部",
    position: "レッド館1F",
    keywords: ["ぱずるとりで", "パズ研", "化学講義室"],
  },
  {
    id: "50",
    locid: "117",
    name: "数研2025",
    category: "体験",
    organizer: "数学科学研究部",
    position: "レッド館1F",
    keywords: ["すうけん2025", "すうけん２０２５", "化学講義室"],
  },
  {
    id: "51",
    locid: "118",
    name: "Conical Chemical",
    category: "体験",
    organizer: "中高科学部",
    position: "レッド館1F",
    keywords: [
      "こにかるけみかる",
      "コニカルケミカル",
      "中高化学部",
      "実験ショー",
      "化学実験室",
    ],
  },
  {
    id: "52",
    locid: "105",
    name: "美術科展示",
    category: "展示 (特別)",
    organizer: "美術科",
    position: "レッド館2F",
    keywords: ["びじゅつかてんじ", "美術室"],
  },
  {
    id: "53",
    locid: "101",
    name: "Wind Festa 2025 -Harmonia-",
    category: "パフォーマンス",
    organizer: "中高音楽部",
    position: "体育館",
    keywords: [
      "ういんどふぇすた2025はーもにあ",
      "ウインドフェスタ2025ハーモニア",
      "うぃんどふぇすた２０２５はーもにあ",
      "ウインドフェスタ２０２５ハーモニア",
      "吹奏楽部",
    ],
  },
  {
    id: "92",
    locid: "101",
    name: "轟",
    category: "その他",
    organizer: "中夜祭",
    position: "体育館",
    keywords: ["とどろき", "ちゅうやさい"],
  },
  {
    id: "54",
    locid: "158",
    name: "Free Fall",
    category: "パフォーマンス",
    organizer: "筑駒Jugglers",
    position: "屋外",
    keywords: [
      "ふりーふぉーる",
      "フリーフォール",
      "筑駒ジャグラーズ",
      "ジャグリング",
      "パフォーマンスストリート",
      "岩石園",
    ],
  },
  {
    id: "55",
    locid: "116",
    name: "書道科展示",
    category: "展示 (特別)",
    organizer: "書道科",
    position: "6号館",
    keywords: ["しょどうかてんじ", "書道室"],
  },
  {
    id: "59",
    locid: "125",
    name: "事務室",
    category: "その他",
    organizer: "",
    position: "1号館1F",
    keywords: ["じむしつ", "事務所"],
  },
  {
    id: "60",
    locid: "126",
    name: "フォトスタジオ",
    category: "その他",
    organizer: "",
    position: "屋外",
    keywords: [
      "ふぉとすたじお",
      "フォトスポット",
      "ふぉとすぽっと",
      "写真スポット",
      "しゃしんすぽっと",
      "記念写真",
      "ロータリー",
      "ろーたりー",
    ],
  },
  {
    id: "61",
    locid: "136",
    name: "オレンジ館東男子トイレ",
    category: "男子トイレ",
    organizer: "",
    position: "オレンジ館2-3F踊り場",
    keywords: ["だんしといれ"],
  },
  {
    id: "62",
    locid: "137",
    name: "オレンジ館西男子トイレ",
    category: "男子トイレ",
    organizer: "",
    position: "オレンジ館2-3F踊り場",
    keywords: ["だんしといれ"],
  },
  {
    id: "63",
    locid: "139",
    name: "ブルー館東男子トイレ",
    category: "男子トイレ",
    organizer: "",
    position: "ブルー館2-3F踊り場",
    keywords: ["だんしといれ"],
  },
  {
    id: "64",
    locid: "140",
    name: "ブルー館西男子トイレ",
    category: "男子トイレ",
    organizer: "",
    position: "ブルー館2-3F踊り場",
    keywords: ["だんしといれ"],
  },
  {
    id: "65",
    locid: "146",
    name: "オレンジ館東女子トイレ",
    category: "女子トイレ",
    organizer: "",
    position: "オレンジ館1-2F踊り場",
    keywords: ["じょしといれ"],
  },
  {
    id: "66",
    locid: "147",
    name: "オレンジ館西女子トイレ",
    category: "女子トイレ",
    organizer: "",
    position: "オレンジ館1-2F踊り場",
    keywords: ["じょしといれ"],
  },
  {
    id: "67",
    locid: "150",
    name: "ブルー館東女子トイレ",
    category: "女子トイレ",
    organizer: "",
    position: "ブルー館1-2F踊り場",
    keywords: ["じょしといれ"],
  },
  {
    id: "68",
    locid: "151",
    name: "ブルー館西女子トイレ",
    category: "女子トイレ",
    organizer: "",
    position: "ブルー館1-2F踊り場",
    keywords: ["じょしといれ"],
  },
  {
    id: "69",
    locid: "109",
    name: "レッド館女子トイレ",
    category: "女子トイレ",
    organizer: "",
    position: "レッド館2F",
    keywords: ["じょしといれ"],
  },
  {
    id: "70",
    locid: "115",
    name: "レッド館1Fトイレ",
    category: "男女トイレ",
    organizer: "",
    position: "レッド館1F",
    keywords: ["だんじょといれ"],
  },
  {
    id: "71",
    locid: "56",
    name: "オレンジ館1F東階段前",
    category: "その他",
    organizer: "",
    position: "オレンジ館1F",
    keywords: [],
  },
  {
    id: "72",
    locid: "40",
    name: "オレンジ館2F東階段前",
    category: "その他",
    organizer: "",
    position: "オレンジ館2F",
    keywords: [],
  },
  {
    id: "73",
    locid: "28",
    name: "オレンジ館3F東階段前",
    category: "その他",
    organizer: "",
    position: "オレンジ館3F",
    keywords: [],
  },
  {
    id: "74",
    locid: "57",
    name: "オレンジ館1F西階段前",
    category: "その他",
    organizer: "",
    position: "オレンジ館1F",
    keywords: [],
  },
  {
    id: "75",
    locid: "43",
    name: "オレンジ館2F西階段前",
    category: "その他",
    organizer: "",
    position: "オレンジ館2F",
    keywords: [],
  },
  {
    id: "76",
    locid: "29",
    name: "オレンジ館3F西階段前",
    category: "その他",
    organizer: "",
    position: "オレンジ館3F",
    keywords: [],
  },
  {
    id: "77",
    locid: "59",
    name: "ブルー館1F東階段前",
    category: "その他",
    organizer: "",
    position: "ブルー館1F",
    keywords: [],
  },
  {
    id: "78",
    locid: "45",
    name: "ブルー館2F東階段前",
    category: "その他",
    organizer: "",
    position: "ブルー館2F",
    keywords: [],
  },
  {
    id: "79",
    locid: "33",
    name: "ブルー館3F東階段前",
    category: "その他",
    organizer: "",
    position: "ブルー館3F",
    keywords: [],
  },
  {
    id: "80",
    locid: "66",
    name: "ブルー館1F西階段前",
    category: "その他",
    organizer: "",
    position: "ブルー館1F",
    keywords: [],
  },
  {
    id: "81",
    locid: "48",
    name: "ブルー館2F西階段前",
    category: "その他",
    organizer: "",
    position: "ブルー館2F",
    keywords: [],
  },
  {
    id: "82",
    locid: "34",
    name: "ブルー館3F西階段前",
    category: "その他",
    organizer: "",
    position: "ブルー館3F",
    keywords: [],
  },
  {
    id: "83",
    locid: "14",
    name: "レッド館1F東階段前",
    category: "その他",
    organizer: "",
    position: "レッド館1F",
    keywords: [],
  },
  {
    id: "84",
    locid: "6",
    name: "レッド館2F東階段前",
    category: "その他",
    organizer: "",
    position: "レッド館2F",
    keywords: [],
  },
  {
    id: "85",
    locid: "3",
    name: "レッド館3F東階段前",
    category: "その他",
    organizer: "",
    position: "レッド館3F",
    keywords: [],
  },
  {
    id: "86",
    locid: "19",
    name: "レッド館1F西階段前",
    category: "その他",
    organizer: "",
    position: "レッド館1F",
    keywords: [],
  },
  {
    id: "87",
    locid: "12",
    name: "レッド館2F西階段前",
    category: "その他",
    organizer: "",
    position: "レッド館2F",
    keywords: [],
  },
  {
    id: "88",
    locid: "4",
    name: "レッド館3F西階段前",
    category: "その他",
    organizer: "",
    position: "レッド館3F",
    keywords: [],
  },
];

export function getLocationById(id: string): Location | null {
  return LOCATIONS.find((location) => location.id === id) || null;
}

export const maleBathrooms = LOCATIONS.filter(
  (loc) => loc.category === "男子トイレ" || loc.category === "男女トイレ"
);
export const femaleBathrooms = LOCATIONS.filter(
  (loc) => loc.category === "女子トイレ" || loc.category === "男女トイレ"
);

interface LocationSelectorProps {
  label: string;
  placeholder: string;
  value: Location | null;
  departure: boolean;
  onChange: (location: Location | null) => void;
}

export function LocationSelector({
  label,
  placeholder,
  value,
  departure,
  onChange,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLocations, setFilteredLocations] = useState(LOCATIONS);
  const [highlight, setHighlight] = useState(false);
  const [inputHighlight, setInputHighlight] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [showInputBalloon, setShowInputBalloon] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();

  const isQr = searchParams.get("qr");
  const dep = searchParams.get("dep");
  const dest = searchParams.get("dest");

  function kanaToHira(str: string) {
    return str.replace(/[\u30a1-\u30f6]/g, function (match) {
      var chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    });
  }

  useEffect(() => {
    // Trigger both effects on mount
    if (isQr) {
      setHighlight(true);
    }

    const timer = setTimeout(() => {
      setHighlight(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log(searchTerm);
    const term = kanaToHira(searchTerm.toLowerCase());

    const filtered = LOCATIONS.filter(
      (location) =>
        (kanaToHira(location.name.toLowerCase()).includes(term) ||
          kanaToHira(location.category.toLowerCase()).includes(term) ||
          kanaToHira(location.organizer.toLowerCase()).includes(term) ||
          kanaToHira(location.position.toLowerCase()).includes(term) ||
          location.keywords.some((keyword) =>
            kanaToHira(keyword.toLowerCase()).includes(term)
          )) &&
        (departure
          ? !["m", "f", "169"].includes(location.locid)
          : !["106"].includes(location.locid))
    )
      .map((location, index) => {
        let score = 0;

        if (location.name.toLowerCase().includes(term))
          score = Math.max(score, 1);
        if (location.organizer.toLowerCase().includes(term))
          score = Math.max(score, 0.9);
        if (
          location.keywords.some((keyword) =>
            keyword.toLowerCase().includes(term)
          )
        )
          score = Math.max(score, 0.8);
        if (location.category.toLowerCase().includes(term))
          score = Math.max(score, 0.7);
        if (location.position.toLowerCase().includes(term))
          score = Math.max(score, 0.6);

        if (
          // location.name.includes("トイレ") ||
          location.name.includes("階段前")
        ) {
          score -= 0.5; // deprioritize bathrooms and staircases
        }

        return { location, score, originalIndex: index };
      })
      .sort((a, b) => {
        if (b.score === a.score) {
          return a.originalIndex - b.originalIndex; // keep original order for ties
        }
        return b.score - a.score; // sort descending by score
      })
      .map((item) => item.location);

    setFilteredLocations(filtered);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputClick = () => {
    setIsOpen(!isOpen);
    setSearchTerm("");

    // Only trigger the blue border the first time it's opened
    if (!hasOpened) {
      setInputHighlight(true);
      setHasOpened(true);
      setShowInputBalloon(true);
      setTimeout(() => {
        setInputHighlight(false);
        setShowInputBalloon(false);
      }, 5000);
    }
  };

  const handleLocationSelect = (location: Location) => {
    onChange(location);
    setIsOpen(false);
    setSearchTerm("");
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      高3: "bg-fuchsia-100 text-fuchsia-900",
      展示: "bg-green-100 text-green-900",
      体験: "bg-red-100 text-red-900",
      映画: "bg-blue-100 text-blue-900",
      演劇: "bg-sky-100 text-sky-900",
      パフォーマンス: "bg-amber-100 text-amber-900",
      "展示 (特別)": "bg-neutral-100 text-neutral-900",

      男子トイレ: "bg-blue-100 text-blue-900",
      女子トイレ: "bg-pink-100 text-pink-900",
      男女トイレ: "bg-purple-100 text-purple-900",
      その他: "bg-neutral-100 text-neutral-900",
      避難所: "bg-red-200 text-red-800",
      男子トイレ自動選択: "bg-blue-200 text-blue-800",
      女子トイレ自動選択: "bg-pink-200 text-pink-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-muted-foreground mb-2">
        {label}
      </label>

      <div
        className={`w-full bg-input transition-all duration-300 rounded-lg ${
          highlight && ((departure && dep) || (!departure && dest))
            ? "border-2 border-blue-500"
            : "border border-2 border-border"
        } min-h-[72px] rounded-lg px-4 py-3 cursor-pointer flex items-center justify-between`}
        onClick={handleInputClick}
      >
        <div className="flex items-center gap-3 flex-1">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          {value ? (
            <div>
              <div className="font-medium text-lg">{value.name}</div>
              <div className="text-sm text-muted-foreground">
                {value.position +
                  (value.organizer ? `, ${value.organizer}` : "")}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />

        {highlight &&
          (departure && dep ? (
            <div className="absolute -bottom-12 right-0 mt-0 z-10 bg-blue-500 text-white rounded-lg py-2 px-3 shadow-lg animate-fade-in-out">
              出発地点が自動入力されました
              <div className="absolute top-0 left-4 w-2 h-2 bg-blue-500 rotate-45 -translate-y-1" />
            </div>
          ) : (
            !departure &&
            dest && (
              <div className="absolute -bottom-12 right-0 mt-0 z-10 bg-blue-500 text-white rounded-lg py-2 px-3 shadow-lg animate-fade-in-out">
                目的地が自動入力されました
                <div className="absolute top-0 left-4 w-2 h-2 bg-blue-500 rotate-45 -translate-y-1" />
              </div>
            )
          ))}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-2 border-border rounded-lg shadow-lg z-50">
          <div className="relative w-full">
            {showInputBalloon && (
              <div className="absolute w-48 -top-16 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white rounded-lg py-2 px-3 shadow-lg animate-fade-in-out pointer-events-none">
                {departure
                  ? "キーワードで出発地点を検索できます"
                  : "キーワードで目的地を検索できます"}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-blue-500 rotate-45" />
              </div>
            )}

            <input
              ref={inputRef}
              name={departure ? "ここに入力して検索" : "ここに入力して検索"}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder=""
              autoFocus
              className={`w-full bg-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300 ${
                inputHighlight
                  ? "border-4 border-blue-500"
                  : "border border-border"
              }`}
            />

            {!searchTerm && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none select-none text-transparent sparkle-placeholder">
                {departure ? "ここに入力して検索…" : "ここに入力して検索…"}
              </span>
            )}

            <style jsx>{`
              .sparkle-placeholder {
                background: linear-gradient(
                  90deg,
                  #5481caff,
                  #cb3881ff,
                  #bc6a2fff,
                  #5481caff
                ); /* looped start/end color for seamless animation */
                background-size: 300% auto;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: sparkleFlow 7.5s linear infinite;
              }

              @keyframes sparkleFlow {
                0% {
                  background-position: 0% 0%;
                }
                100% {
                  background-position: 300% 0%;
                }
              }
            `}</style>
          </div>

          <div className="max-h-[38vh] overflow-y-auto top-full">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer border-b border-border last:border-b-0"
                  onClick={() => handleLocationSelect(location)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{location.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {location.organizer ? location.organizer : ""}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        location.category
                      )}`}
                    >
                      {location.category}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                場所が見つかりません…
                <br />
                <span className="text-sm text-muted-foreground">
                  ひらがなではヒットしない場合があります
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
