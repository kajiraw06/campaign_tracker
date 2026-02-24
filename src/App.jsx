import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Users, Calendar, Filter, Video, Radio, ExternalLink, Plus, Trash2, Edit2, X, BarChart2, Activity } from 'lucide-react';
import { db, FIREBASE_CONFIGURED } from './firebase';
import {
  collection, doc, onSnapshot, addDoc, updateDoc,
  deleteDoc, writeBatch, getDocs, setDoc,
} from 'firebase/firestore';

// --- DATA SOURCE ---
const rawData = [
  // --- JAN 23 ---
  { date: '2026-01-23', site: 'WFL', streamer: 'HolyFather', spend: 689.62, reg: 91, dep: 2750.00, type: 'Live', link: 'https://www.facebook.com/watch/live/?v=885683144393946' },
  { date: '2026-01-23', site: 'RLM', streamer: 'Pepper', spend: 330.97, reg: 12, dep: 0.00, type: 'Reels', link: 'https://www.facebook.com/reel/1174627438196210' },
  { date: '2026-01-23', site: 'RLM', streamer: 'AJ', spend: 127.10, reg: 2, dep: 2000.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-01-23', site: 'RLM', streamer: 'Kim', spend: 0, reg: 0, dep: 15400.00, type: 'Live', link: 'https://www.facebook.com/videos/' },
  { date: '2026-01-23', site: 'RLM', streamer: 'Jape', spend: 0, reg: 0, dep: 700.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-01-23', site: 'RLM', streamer: 'Yuji', spend: 0, reg: 1, dep: 0.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },

  // --- JAN 24 ---
  { date: '2026-01-24', site: 'WFL', streamer: 'HolyFather', spend: 2878.97, reg: 87, dep: 9155.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-01-24', site: 'WFL', streamer: 'Jason', spend: 992.27, reg: 5, dep: 500.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/1222680836504331' },
  { date: '2026-01-24', site: 'WFL', streamer: 'Jason', spend: 28.65, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/videos/2024003294810360' },
  { date: '2026-01-24', site: 'WFL', streamer: 'Aether', spend: 619.78, reg: 2, dep: 0.00, type: 'Live', link: 'https://www.facebook.com/TeamAetherEsports/videos/1211344391104087' },
  { date: '2026-01-24', site: 'WFL', streamer: 'Aether', spend: 393.78, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/TeamAetherEsports/reels/' },
  { date: '2026-01-24', site: 'RLM', streamer: 'Pepper', spend: 1016.57, reg: 56, dep: 4600.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/2286907945120179' },
  { date: '2026-01-24', site: 'RLM', streamer: 'Pepper', spend: 1968.02, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AkoSiPepVT/reels/' },
  { date: '2026-01-24', site: 'RLM', streamer: 'AJ', spend: 1027.69, reg: 26, dep: 8168.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/719770387658466' },
  { date: '2026-01-24', site: 'RLM', streamer: 'Yuji', spend: 1139.34, reg: 17, dep: 1195.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/2083950799106728' },
  { date: '2026-01-24', site: 'RLM', streamer: 'Kim', spend: 0, reg: 0, dep: 2800.00, type: 'Live', link: 'https://www.facebook.com/videos/' },
  { date: '2026-01-24', site: 'RLM', streamer: 'Jape', spend: 0, reg: 0, dep: 900.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },

  // --- JAN 25 ---
  { date: '2026-01-25', site: 'WFL', streamer: 'HolyFather', spend: 3667.75, reg: 114, dep: 24945.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-01-25', site: 'WFL', streamer: 'Jason', spend: 1502.76, reg: 7, dep: 650.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-01-25', site: 'WFL', streamer: 'Jason', spend: 1313.79, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-01-25', site: 'WFL', streamer: 'Aether', spend: 829.04, reg: 7, dep: 400.00, type: 'Live', link: 'https://www.facebook.com/TeamAetherEsports/videos/' },
  { date: '2026-01-25', site: 'WFL', streamer: 'Aether', spend: 1115.41, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/TeamAetherEsports/reels/' },
  { date: '2026-01-25', site: 'WFL', streamer: 'Neggy', spend: 0, reg: 6, dep: 1700.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-01-25', site: 'RLM', streamer: 'Pepper', spend: 980.72, reg: 27, dep: 6200.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-01-25', site: 'RLM', streamer: 'Pepper', spend: 1370.11, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AkoSiPepVT/reels/' },
  { date: '2026-01-25', site: 'RLM', streamer: 'AJ', spend: 868.00, reg: 26, dep: 9400.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-01-25', site: 'RLM', streamer: 'AJ', spend: 425.84, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-01-25', site: 'RLM', streamer: 'Yuji', spend: 681.78, reg: 19, dep: 1633.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },
  { date: '2026-01-25', site: 'RLM', streamer: 'Yuji', spend: 430.49, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/MageDadOfficial/reels/' },
  { date: '2026-01-25', site: 'RLM', streamer: 'Jape', spend: 471.41, reg: 3, dep: 600.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-01-25', site: 'RLM', streamer: 'Kim', spend: 0, reg: 0, dep: 3900.00, type: 'Live', link: 'https://www.facebook.com/videos/' },
  { date: '2026-01-25', site: 'RLM', streamer: 'Sainty', spend: 0, reg: 0, dep: 3457.00, type: 'Reels', link: 'https://www.facebook.com/reels/' },

  // --- JAN 26 ---
  { date: '2026-01-26', site: 'WFL', streamer: 'Jason', spend: 1338.83, reg: 10, dep: 1430.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-01-26', site: 'WFL', streamer: 'Jason', spend: 1663.53, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-01-26', site: 'WFL', streamer: 'HolyFather', spend: 1904.14, reg: 141, dep: 24590.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-01-26', site: 'WFL', streamer: 'Aether', spend: 649.85, reg: 0, dep: 200.00, type: 'Live', link: 'https://www.facebook.com/TeamAetherEsports/videos/' },
  { date: '2026-01-26', site: 'WFL', streamer: 'Aether', spend: 585.73, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/TeamAetherEsports/reels/' },
  { date: '2026-01-26', site: 'WFL', streamer: 'Neggy', spend: 35.32, reg: 2, dep: 0.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-01-26', site: 'RLM', streamer: 'Pepper', spend: 1005.39, reg: 29, dep: 5400.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-01-26', site: 'RLM', streamer: 'Pepper', spend: 2568.09, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AkoSiPepVT/reels/' },
  { date: '2026-01-26', site: 'RLM', streamer: 'AJ', spend: 1853.24, reg: 17, dep: 6081.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-01-26', site: 'RLM', streamer: 'AJ', spend: 937.98, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-01-26', site: 'RLM', streamer: 'Yuji', spend: 1874.16, reg: 11, dep: 850.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },
  { date: '2026-01-26', site: 'RLM', streamer: 'Yuji', spend: 701.98, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/MageDadOfficial/reels/' },
  { date: '2026-01-26', site: 'RLM', streamer: 'Jape', spend: 671.62, reg: 5, dep: 1700.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-01-26', site: 'RLM', streamer: 'Kim', spend: 0, reg: 0, dep: 5500.00, type: 'Live', link: 'https://www.facebook.com/videos/' },
  { date: '2026-01-26', site: 'RLM', streamer: 'Sainty', spend: 0, reg: 0, dep: 2539.00, type: 'Reels', link: 'https://www.facebook.com/reels/' },

  // --- JAN 27 ---
  { date: '2026-01-27', site: 'WFL', streamer: 'Jason', spend: 1127.48, reg: 4, dep: 850.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-01-27', site: 'WFL', streamer: 'Jason', spend: 1979.10, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-01-27', site: 'WFL', streamer: 'HolyFather', spend: 2176.02, reg: 123, dep: 35805.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-01-27', site: 'WFL', streamer: 'Neggy', spend: 733.55, reg: 6, dep: 1700.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-01-27', site: 'WFL', streamer: 'Neggy', spend: 163.60, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/NeggyTvOfficial/reels/' },
  { date: '2026-01-27', site: 'WFL', streamer: 'Aether', spend: 179.03, reg: 3, dep: 0.00, type: 'Live', link: 'https://www.facebook.com/TeamAetherEsports/videos/' },
  { date: '2026-01-27', site: 'WFL', streamer: 'Aether', spend: 1504.10, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/TeamAetherEsports/reels/' },
  { date: '2026-01-27', site: 'RLM', streamer: 'AJ', spend: 988.21, reg: 19, dep: 3751.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-01-27', site: 'RLM', streamer: 'AJ', spend: 1742.59, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-01-27', site: 'RLM', streamer: 'Yuji', spend: 740.36, reg: 3, dep: 1220.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },
  { date: '2026-01-27', site: 'RLM', streamer: 'Yuji', spend: 1493.01, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/MageDadOfficial/reels/' },
  { date: '2026-01-27', site: 'RLM', streamer: 'Pepper', spend: 681.82, reg: 11, dep: 2900.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-01-27', site: 'RLM', streamer: 'Pepper', spend: 816.93, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AkoSiPepVT/reels/' },
  { date: '2026-01-27', site: 'RLM', streamer: 'Jape', spend: 1161.74, reg: 7, dep: 6440.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-01-27', site: 'RLM', streamer: 'Kim', spend: 0, reg: 0, dep: 1500.00, type: 'Live', link: 'https://www.facebook.com/videos/' },

  // --- JAN 28 ---
  { date: '2026-01-28', site: 'WFL', streamer: 'Jason', spend: 1811.06, reg: 11, dep: 1500.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-01-28', site: 'WFL', streamer: 'Jason', spend: 1861.83, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-01-28', site: 'WFL', streamer: 'HolyFather', spend: 3614.59, reg: 53, dep: 12637.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-01-28', site: 'WFL', streamer: 'HolyFather', spend: 2.99, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/100084497334397/reels/' },
  { date: '2026-01-28', site: 'WFL', streamer: 'Neggy', spend: 839.04, reg: 6, dep: 1440.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-01-28', site: 'WFL', streamer: 'Neggy', spend: 872.41, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/NeggyTvOfficial/reels/' },
  { date: '2026-01-28', site: 'WFL', streamer: 'Aether', spend: 720.25, reg: 0, dep: 0.00, type: 'Reels', link: 'https://www.facebook.com/TeamAetherEsports/reels/' },
  { date: '2026-01-28', site: 'RLM', streamer: 'Pepper', spend: 871.68, reg: 10, dep: 1450.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-01-28', site: 'RLM', streamer: 'Pepper', spend: 967.76, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AkoSiPepVT/reels/' },
  { date: '2026-01-28', site: 'RLM', streamer: 'AJ', spend: 1836.84, reg: 21, dep: 4742.00, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-01-28', site: 'RLM', streamer: 'Yuji', spend: 37.80, reg: 0, dep: 0, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },
  { date: '2026-01-28', site: 'RLM', streamer: 'Yuji', spend: 1182.51, reg: 7, dep: 2380.00, type: 'Reels', link: 'https://www.facebook.com/MageDadOfficial/reels/' },
  { date: '2026-01-28', site: 'RLM', streamer: 'Jape', spend: 794.34, reg: 2, dep: 6600.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-01-28', site: 'RLM', streamer: 'Sainty', spend: 101.69, reg: 0, dep: 0.00, type: 'Reels', link: 'https://www.facebook.com/reels/' },
  { date: '2026-01-28', site: 'RLM', streamer: 'Kim', spend: 0, reg: 0, dep: 3000.00, type: 'Live', link: 'https://www.facebook.com/videos/' },

  // --- JAN 29 ---
  { date: '2026-01-29', site: 'WFL', streamer: 'HolyFather', spend: 3374.46, reg: 149, dep: 23699.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-01-29', site: 'WFL', streamer: 'HolyFather', spend: 279.60, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/100084497334397/reels/' },
  { date: '2026-01-29', site: 'WFL', streamer: 'Jason', spend: 1311.13, reg: 13, dep: 2600.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-01-29', site: 'WFL', streamer: 'Jason', spend: 1346.51, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-01-29', site: 'WFL', streamer: 'Neggy', spend: 900.99, reg: 1, dep: 400.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-01-29', site: 'WFL', streamer: 'Aether', spend: 1423.22, reg: 1, dep: 900.00, type: 'Reels', link: 'https://www.facebook.com/TeamAetherEsports/reels/' },
  { date: '2026-01-29', site: 'WFL', streamer: 'GhostWrecker', spend: 0, reg: 6, dep: 700.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-01-29', site: 'RLM', streamer: 'AJ', spend: 616.22, reg: 8, dep: 3428.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-01-29', site: 'RLM', streamer: 'AJ', spend: 1035.15, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-01-29', site: 'RLM', streamer: 'Jape', spend: 994.83, reg: 20, dep: 3608.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-01-29', site: 'RLM', streamer: 'Yuji', spend: 1013.25, reg: 7, dep: 800.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },
  { date: '2026-01-29', site: 'RLM', streamer: 'Pepper', spend: 1496.82, reg: 12, dep: 2801.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-01-29', site: 'RLM', streamer: 'Sainty', spend: 1308.68, reg: 4, dep: 2400.00, type: 'Reels', link: 'https://www.facebook.com/reels/' },
  { date: '2026-01-29', site: 'RLM', streamer: 'Kim', spend: 0, reg: 0, dep: 100.00, type: 'Live', link: 'https://www.facebook.com/videos/' },

  // --- JAN 30 ---
  { date: '2026-01-30', site: 'WFL', streamer: 'HolyFather', spend: 1594.24, reg: 131, dep: 16175.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-01-30', site: 'WFL', streamer: 'HolyFather', spend: 580.33, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/100084497334397/reels/' },
  { date: '2026-01-30', site: 'WFL', streamer: 'Jason', spend: 1095.54, reg: 10, dep: 1540.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-01-30', site: 'WFL', streamer: 'Jason', spend: 1859.04, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-01-30', site: 'WFL', streamer: 'Neggy', spend: 1243.47, reg: 3, dep: 200.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-01-30', site: 'WFL', streamer: 'GhostWrecker', spend: 426.90, reg: 0, dep: 200.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-01-30', site: 'WFL', streamer: 'Aether', spend: 867.37, reg: 24, dep: 2300.00, type: 'Reels', link: 'https://www.facebook.com/TeamAetherEsports/reels/' },
  { date: '2026-01-30', site: 'WFL', streamer: 'ATO', spend: 60.04, reg: 4, dep: 200.00, type: 'Live', link: 'https://www.facebook.com/AtoClassSWorldwide/videos/' },
  { date: '2026-01-30', site: 'RLM', streamer: 'AJ', spend: 415.07, reg: 9, dep: 10451.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-01-30', site: 'RLM', streamer: 'AJ', spend: 1199.83, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-01-30', site: 'RLM', streamer: 'Yuji', spend: 1840.85, reg: 30, dep: 4499.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },
  { date: '2026-01-30', site: 'RLM', streamer: 'Sainty', spend: 2052.89, reg: 20, dep: 3200.00, type: 'Reels', link: 'https://www.facebook.com/reels/' },
  { date: '2026-01-30', site: 'RLM', streamer: 'Pepper', spend: 1760.28, reg: 9, dep: 2200.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-01-30', site: 'RLM', streamer: 'Jape', spend: 459.73, reg: 23, dep: 19100.00, type: 'Live', link: 'https://www.facebook.com/JapeAldeaOfficial/videos/' },
  { date: '2026-01-30', site: 'RLM', streamer: 'Jape', spend: 160.65, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },

  // --- JAN 31 ---
  { date: '2026-01-31', site: 'WFL', streamer: 'HolyFather', spend: 4368.29, reg: 170, dep: 20239.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-01-31', site: 'WFL', streamer: 'HolyFather', spend: 2098.39, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/100084497334397/reels/' },
  { date: '2026-01-31', site: 'WFL', streamer: 'Jason', spend: 1534.14, reg: 9, dep: 999.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-01-31', site: 'WFL', streamer: 'Jason', spend: 939.62, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-01-31', site: 'WFL', streamer: 'Neggy', spend: 1572.52, reg: 5, dep: 300.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-01-31', site: 'WFL', streamer: 'GhostWrecker', spend: 1470.71, reg: 14, dep: 2500.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-01-31', site: 'WFL', streamer: 'ATO', spend: 1246.05, reg: 2, dep: 200.00, type: 'Live', link: 'https://www.facebook.com/AtoClassSWorldwide/videos/' },
  { date: '2026-01-31', site: 'WFL', streamer: 'Aether', spend: 0, reg: 0, dep: 500.00, type: 'Reels', link: 'https://www.facebook.com/TeamAetherEsports/reels/' },
  { date: '2026-01-31', site: 'RLM', streamer: 'Yuji', spend: 1989.45, reg: 24, dep: 5300.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },
  { date: '2026-01-31', site: 'RLM', streamer: 'Jape', spend: 2901.18, reg: 43, dep: 13974.00, type: 'Live', link: 'https://www.facebook.com/JapeAldeaOfficial/videos/' },
  { date: '2026-01-31', site: 'RLM', streamer: 'Jape', spend: 1281.30, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-01-31', site: 'RLM', streamer: 'AJ', spend: 1126.31, reg: 17, dep: 2995.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-01-31', site: 'RLM', streamer: 'AJ', spend: 1256.70, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-01-31', site: 'RLM', streamer: 'Sainty', spend: 266.49, reg: 5, dep: 300.00, type: 'Reels', link: 'https://www.facebook.com/reels/' },
  { date: '2026-01-31', site: 'RLM', streamer: 'Pepper', spend: 212.62, reg: 9, dep: 1050.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-01-31', site: 'RLM', streamer: 'Kim', spend: 0, reg: 0, dep: 2500.00, type: 'Live', link: 'https://www.facebook.com/videos/' },

  // --- FEB 1 ---
  { date: '2026-02-01', site: 'WFL', streamer: 'HolyFather', spend: 3411.01, reg: 41, dep: 13984.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-01', site: 'WFL', streamer: 'Jason', spend: 1957.63, reg: 10, dep: 1100.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-02-01', site: 'WFL', streamer: 'Jason', spend: 498.33, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-02-01', site: 'WFL', streamer: 'Neggy', spend: 1911.97, reg: 9, dep: 550.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-02-01', site: 'WFL', streamer: 'ATO', spend: 1178.61, reg: 4, dep: 500.00, type: 'Live', link: 'https://www.facebook.com/AtoClassSWorldwide/videos/' },
  { date: '2026-02-01', site: 'WFL', streamer: 'GhostWrecker', spend: 823.76, reg: 15, dep: 3009.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-02-01', site: 'WFL', streamer: 'Aether', spend: 0, reg: 0, dep: 650.00, type: 'Live', link: 'https://www.facebook.com/TeamAetherEsports/videos/' },
  { date: '2026-02-01', site: 'RLM', streamer: 'Sainty', spend: 2198.42, reg: 8, dep: 3602.00, type: 'Reels', link: 'https://www.facebook.com/reels/' },
  { date: '2026-02-01', site: 'RLM', streamer: 'Jape', spend: 2982.60, reg: 27, dep: 9461.00, type: 'Live', link: 'https://www.facebook.com/JapeAldeaOfficial/videos/' },
  { date: '2026-02-01', site: 'RLM', streamer: 'Jape', spend: 997.45, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-02-01', site: 'RLM', streamer: 'AJ', spend: 1086.03, reg: 22, dep: 14314.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-02-01', site: 'RLM', streamer: 'AJ', spend: 959.16, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-02-01', site: 'RLM', streamer: 'Pepper', spend: 940.63, reg: 13, dep: 1350.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-02-01', site: 'RLM', streamer: 'Yuji', spend: 213.07, reg: 8, dep: 2250.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },
  { date: '2026-02-01', site: 'RLM', streamer: 'Kim', spend: 0, reg: 0, dep: 400.00, type: 'Live', link: 'https://www.facebook.com/videos/' },

  // --- FEB 2 ---
  { date: '2026-02-02', site: 'WFL', streamer: 'Jason', spend: 3093.46, reg: 11, dep: 2600.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-02-02', site: 'WFL', streamer: 'Jason', spend: 950.23, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-02-02', site: 'WFL', streamer: 'HolyFather', spend: 2547.68, reg: 38, dep: 100093.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-02', site: 'WFL', streamer: 'Neggy', spend: 2849.19, reg: 17, dep: 2320.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-02-02', site: 'WFL', streamer: 'ATO', spend: 1643.14, reg: 5, dep: 500.00, type: 'Live', link: 'https://www.facebook.com/AtoClassSWorldwide/videos/' },
  { date: '2026-02-02', site: 'WFL', streamer: 'Aether', spend: 803.94, reg: 2, dep: 1200.00, type: 'Live', link: 'https://www.facebook.com/TeamAetherEsports/videos/' },
  { date: '2026-02-02', site: 'WFL', streamer: 'Aether', spend: 1390.89, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/TeamAetherEsports/reels/' },
  { date: '2026-02-02', site: 'WFL', streamer: 'GhostWrecker', spend: 0, reg: 9, dep: 3788.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-02-02', site: 'RLM', streamer: 'AJ', spend: 1814.39, reg: 36, dep: 5843.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-02-02', site: 'RLM', streamer: 'AJ', spend: 1144.61, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-02-02', site: 'RLM', streamer: 'Pepper', spend: 2022.29, reg: 8, dep: 5800.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-02-02', site: 'RLM', streamer: 'Sainty', spend: 1646.19, reg: 5, dep: 100.00, type: 'Reels', link: 'https://www.facebook.com/reels/' },
  { date: '2026-02-02', site: 'RLM', streamer: 'Jape', spend: 2311.13, reg: 25, dep: 25824.00, type: 'Live', link: 'https://www.facebook.com/JapeAldeaOfficial/videos/' },
  { date: '2026-02-02', site: 'RLM', streamer: 'Yuji', spend: 255.78, reg: 4, dep: 700.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },
  { date: '2026-02-02', site: 'RLM', streamer: 'Kim', spend: 0, reg: 0, dep: 1000.00, type: 'Live', link: 'https://www.facebook.com/videos/' },
  { date: '2026-02-02', site: 'PP', streamer: 'OSAS', spend: 2501.39, reg: 0, dep: 0, type: 'Reels', link: '' },

  // --- FEB 3 ---
  { date: '2026-02-03', site: 'WFL', streamer: 'Jason', spend: 1995.44, reg: 9, dep: 1000.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-02-03', site: 'WFL', streamer: 'Jason', spend: 816.49, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-02-03', site: 'WFL', streamer: 'Neggy', spend: 2742.93, reg: 10, dep: 2900.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-02-03', site: 'WFL', streamer: 'Neggy', spend: 519.00, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/NeggyTvOfficial/reels/' },
  { date: '2026-02-03', site: 'WFL', streamer: 'Aether', spend: 822.75, reg: 3, dep: 540.00, type: 'Live', link: 'https://www.facebook.com/TeamAetherEsports/videos/' },
  { date: '2026-02-03', site: 'WFL', streamer: 'Aether', spend: 131.82, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/TeamAetherEsports/reels/' },
  { date: '2026-02-03', site: 'WFL', streamer: 'ATO', spend: 789.84, reg: 3, dep: 1400.00, type: 'Live', link: 'https://www.facebook.com/AtoClassSWorldwide/videos/' },
  { date: '2026-02-03', site: 'WFL', streamer: 'HolyFather', spend: 290.94, reg: 12, dep: 57575.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-03', site: 'WFL', streamer: 'GhostWrecker', spend: 0, reg: 10, dep: 9350.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-02-03', site: 'RLM', streamer: 'Pepper', spend: 2853.47, reg: 12, dep: 2795.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-02-03', site: 'RLM', streamer: 'AJ', spend: 1421.92, reg: 25, dep: 9600.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-02-03', site: 'RLM', streamer: 'AJ', spend: 1474.13, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-02-03', site: 'RLM', streamer: 'Jape', spend: 1802.58, reg: 14, dep: 8320.00, type: 'Live', link: 'https://www.facebook.com/JapeAldeaOfficial/videos/' },
  { date: '2026-02-03', site: 'RLM', streamer: 'Sainty', spend: 386.05, reg: 5, dep: 600.00, type: 'Reels', link: 'https://www.facebook.com/reels/' },
  { date: '2026-02-03', site: 'RLM', streamer: 'Yuji', spend: 208.62, reg: 2, dep: 200.00, type: 'Reels', link: 'https://www.facebook.com/MageDadOfficial/reels/' },
  { date: '2026-02-03', site: 'RLM', streamer: 'Kim', spend: 0, reg: 0, dep: 1500.00, type: 'Live', link: 'https://www.facebook.com/videos/' },
  { date: '2026-02-03', site: 'PP', streamer: 'OSAS', spend: 6136.46, reg: 0, dep: 0, type: 'Reels', link: '' },

  // --- FEB 4 ---
  { date: '2026-02-04', site: 'WFL', streamer: 'Jason', spend: 3569.10, reg: 13, dep: 3190.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-02-04', site: 'WFL', streamer: 'Jason', spend: 721.78, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-02-04', site: 'WFL', streamer: 'Neggy', spend: 3191.46, reg: 26, dep: 7116.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-02-04', site: 'WFL', streamer: 'Neggy', spend: 1101.20, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/NeggyTvOfficial/reels/' },
  { date: '2026-02-04', site: 'WFL', streamer: 'Aether', spend: 1138.24, reg: 2, dep: 100.00, type: 'Live', link: 'https://www.facebook.com/TeamAetherEsports/videos/' },
  { date: '2026-02-04', site: 'WFL', streamer: 'ATO', spend: 972.35, reg: 3, dep: 120.00, type: 'Live', link: 'https://www.facebook.com/AtoClassSWorldwide/videos/' },
  { date: '2026-02-04', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 9, dep: 10317.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-04', site: 'WFL', streamer: 'GhostWrecker', spend: 0, reg: 10, dep: 1500.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-02-04', site: 'RLM', streamer: 'Sainty', spend: 1920.31, reg: 6, dep: 5620.00, type: 'Reels', link: 'https://www.facebook.com/reels/' },
  { date: '2026-02-04', site: 'RLM', streamer: 'AJ', spend: 1107.40, reg: 13, dep: 9290.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-02-04', site: 'RLM', streamer: 'AJ', spend: 974.60, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-02-04', site: 'RLM', streamer: 'Yuji', spend: 1032.72, reg: 12, dep: 850.00, type: 'Reels', link: 'https://www.facebook.com/MageDadOfficial/reels/' },
  { date: '2026-02-04', site: 'RLM', streamer: 'Jape', spend: 971.47, reg: 6, dep: 3495.00, type: 'Live', link: 'https://www.facebook.com/JapeAldeaOfficial/videos/' },
  { date: '2026-02-04', site: 'RLM', streamer: 'Pepper', spend: 0, reg: 1, dep: 500.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-02-04', site: 'RLM', streamer: 'Kim', spend: 0, reg: 0, dep: 100.00, type: 'Live', link: 'https://www.facebook.com/videos/' },
  { date: '2026-02-04', site: 'PP', streamer: 'OSAS', spend: 5605.46, reg: 0, dep: 0, type: 'Reels', link: '' },

  // --- FEB 5 ---
  { date: '2026-02-05', site: 'WFL', streamer: 'Jason', spend: 3173.22, reg: 17, dep: 3100.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-02-05', site: 'WFL', streamer: 'Aether', spend: 207.19, reg: 1, dep: 600.00, type: 'Live', link: 'https://www.facebook.com/TeamAetherEsports/videos/' },
  { date: '2026-02-05', site: 'WFL', streamer: 'Aether', spend: 1679.70, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/TeamAetherEsports/reels/' },
  { date: '2026-02-05', site: 'WFL', streamer: 'Neggy', spend: 1505.96, reg: 17, dep: 4487.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-02-05', site: 'WFL', streamer: 'Neggy', spend: 866.08, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/NeggyTvOfficial/reels/' },
  { date: '2026-02-05', site: 'WFL', streamer: 'GhostWrecker', spend: 397.58, reg: 81, dep: 6700.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-02-05', site: 'WFL', streamer: 'AJ', spend: 423.93, reg: 0, dep: 0.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-02-05', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 12, dep: 4158.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-05', site: 'WFL', streamer: 'ATO', spend: 0, reg: 1, dep: 200.00, type: 'Live', link: 'https://www.facebook.com/AtoClassSWorldwide/videos/' },
  { date: '2026-02-05', site: 'RLM', streamer: 'Sainty', spend: 2658.06, reg: 5, dep: 3219.00, type: 'Reels', link: 'https://www.facebook.com/reels/' },
  { date: '2026-02-05', site: 'RLM', streamer: 'AJ', spend: 1129.54, reg: 19, dep: 15700.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-02-05', site: 'RLM', streamer: 'AJ', spend: 1251.29, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-02-05', site: 'RLM', streamer: 'Yuji', spend: 910.98, reg: 2, dep: 800.00, type: 'Reels', link: 'https://www.facebook.com/MageDadOfficial/reels/' },
  { date: '2026-02-05', site: 'RLM', streamer: 'Jape', spend: 515.13, reg: 3, dep: 13173.00, type: 'Live', link: 'https://www.facebook.com/JapeAldeaOfficial/videos/' },
  { date: '2026-02-05', site: 'RLM', streamer: 'Kim', spend: 0, reg: 0, dep: 1000.00, type: 'Live', link: 'https://www.facebook.com/videos/' },
  { date: '2026-02-05', site: 'RLM', streamer: 'Pepper', spend: 0, reg: 0, dep: 301.00, type: 'Reels', link: 'https://www.facebook.com/AkoSiPepVT/reels/' },
  { date: '2026-02-05', site: 'PP', streamer: 'OSAS', spend: 2122.33, reg: 0, dep: 0, type: 'Reels', link: '' },

  // --- FEB 6 ---
  { date: '2026-02-06', site: 'WFL', streamer: 'Jason', spend: 4003.60, reg: 11, dep: 7350.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-02-06', site: 'WFL', streamer: 'Jason', spend: 242.27, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-02-06', site: 'WFL', streamer: 'Aether', spend: 1702.18, reg: 0, dep: 250.00, type: 'Reels', link: 'https://www.facebook.com/TeamAetherEsports/reels/' },
  { date: '2026-02-06', site: 'WFL', streamer: 'GhostWrecker', spend: 967.29, reg: 58, dep: 10260.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-02-06', site: 'WFL', streamer: 'GhostWrecker', spend: 1.23, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/bosswrecker/reels/' },
  { date: '2026-02-06', site: 'WFL', streamer: 'Neggy', spend: 926.76, reg: 9, dep: 4811.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-02-06', site: 'WFL', streamer: 'Neggy', spend: 494.03, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/NeggyTvOfficial/reels/' },
  { date: '2026-02-06', site: 'WFL', streamer: 'AJ', spend: 1088.86, reg: 0, dep: 0.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-02-06', site: 'WFL', streamer: 'AJ', spend: 330.64, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-02-06', site: 'WFL', streamer: 'ATO', spend: 217.68, reg: 2, dep: 300.00, type: 'Reels', link: 'https://www.facebook.com/AtoClassSWorldwide/reels/' },
  { date: '2026-02-06', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 9, dep: 4270.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-06', site: 'RLM', streamer: 'Sainty', spend: 132.39, reg: 4, dep: 2103.00, type: 'Live', link: 'https://www.facebook.com/videos/' },
  { date: '2026-02-06', site: 'RLM', streamer: 'Sainty', spend: 2447.76, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/reels/' },
  { date: '2026-02-06', site: 'RLM', streamer: 'AJ', spend: 1834.52, reg: 31, dep: 6018.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-02-06', site: 'RLM', streamer: 'AJ', spend: 1386.80, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-02-06', site: 'RLM', streamer: 'Yuji', spend: 990.01, reg: 4, dep: 1026.00, type: 'Reels', link: 'https://www.facebook.com/MageDadOfficial/reels/' },
  { date: '2026-02-06', site: 'RLM', streamer: 'Pepper', spend: 268.19, reg: 14, dep: 6750.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-02-06', site: 'RLM', streamer: 'Jape', spend: 0, reg: 3, dep: 4192.00, type: 'Live', link: 'https://www.facebook.com/JapeAldeaOfficial/videos/' },
  { date: '2026-02-06', site: 'RLM', streamer: 'Kim', spend: 0, reg: 0, dep: 200.00, type: 'Live', link: 'https://www.facebook.com/videos/' },

  // --- FEB 7 ---
  { date: '2026-02-07', site: 'WFL', streamer: 'Jason', spend: 2911.98, reg: 9, dep: 11691.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-02-07', site: 'WFL', streamer: 'Jason', spend: 716.60, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-02-07', site: 'WFL', streamer: 'Aether', spend: 211.76, reg: 1, dep: 400.00, type: 'Live', link: 'https://www.facebook.com/TeamAetherEsports/videos/' },
  { date: '2026-02-07', site: 'WFL', streamer: 'Aether', spend: 1721.97, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/TeamAetherEsports/reels/' },
  { date: '2026-02-07', site: 'WFL', streamer: 'GhostWrecker', spend: 1600.12, reg: 54, dep: 14683.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-02-07', site: 'WFL', streamer: 'GhostWrecker', spend: 553.44, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/bosswrecker/reels/' },
  { date: '2026-02-07', site: 'WFL', streamer: 'AJ', spend: 722.39, reg: 0, dep: 0.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-02-07', site: 'WFL', streamer: 'AJ', spend: 873.72, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-02-07', site: 'WFL', streamer: 'Neggy', spend: 686.50, reg: 8, dep: 3800.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-02-07', site: 'WFL', streamer: 'ATO', spend: 434.85, reg: 3, dep: 100.00, type: 'Reels', link: 'https://www.facebook.com/AtoClassSWorldwide/reels/' },
  { date: '2026-02-07', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 3, dep: 2350.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-07', site: 'RLM', streamer: 'Sainty', spend: 960.76, reg: 2, dep: 4040.00, type: 'Live', link: 'https://www.facebook.com/videos/' },
  { date: '2026-02-07', site: 'RLM', streamer: 'Sainty', spend: 1510.88, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/reels/' },
  { date: '2026-02-07', site: 'RLM', streamer: 'AJ', spend: 2827.42, reg: 19, dep: 12915.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-02-07', site: 'RLM', streamer: 'AJ', spend: 1070.93, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-02-07', site: 'RLM', streamer: 'Pepper', spend: 278.42, reg: 7, dep: 647.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-02-07', site: 'RLM', streamer: 'Jape', spend: 0, reg: 10, dep: 2502.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-02-07', site: 'RLM', streamer: 'Yuji', spend: 0, reg: 1, dep: 800.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },

  // --- FEB 8 ---
  { date: '2026-02-08', site: 'WFL', streamer: 'GhostWrecker', spend: 12079.78, reg: 110, dep: 17955.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-02-08', site: 'WFL', streamer: 'GhostWrecker', spend: 642.84, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/bosswrecker/reels/' },
  { date: '2026-02-08', site: 'WFL', streamer: 'Jason', spend: 2917.72, reg: 4, dep: 4300.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-02-08', site: 'WFL', streamer: 'Jason', spend: 874.41, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-02-08', site: 'WFL', streamer: 'Aether', spend: 783.46, reg: 1, dep: 600.00, type: 'Live', link: 'https://www.facebook.com/TeamAetherEsports/videos/' },
  { date: '2026-02-08', site: 'WFL', streamer: 'Aether', spend: 1140.35, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/TeamAetherEsports/reels/' },
  { date: '2026-02-08', site: 'WFL', streamer: 'ATO', spend: 410.11, reg: 1, dep: 100.00, type: 'Reels', link: 'https://www.facebook.com/AtoClassSWorldwide/reels/' },
  { date: '2026-02-08', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 10, dep: 5168.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-08', site: 'WFL', streamer: 'Neggy', spend: 0, reg: 1, dep: 1400.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-02-08', site: 'RLM', streamer: 'AJ', spend: 2245.76, reg: 21, dep: 12271.00, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-02-08', site: 'RLM', streamer: 'Sainty', spend: 1705.18, reg: 1, dep: 3434.00, type: 'Live', link: 'https://www.facebook.com/videos/' },
  { date: '2026-02-08', site: 'RLM', streamer: 'Sainty', spend: 344.72, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/reels/' },
  { date: '2026-02-08', site: 'RLM', streamer: 'Jape', spend: 0, reg: 6, dep: 2586.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-02-08', site: 'RLM', streamer: 'Yuji', spend: 0, reg: 1, dep: 2250.00, type: 'Reels', link: 'https://www.facebook.com/MageDadOfficial/reels/' },
  { date: '2026-02-08', site: 'RLM', streamer: 'Pepper', spend: 0, reg: 2, dep: 1485.00, type: 'Reels', link: 'https://www.facebook.com/AkoSiPepVT/reels/' },

  // --- FEB 9 ---
  { date: '2026-02-09', site: 'WFL', streamer: 'Jason', spend: 1782.21, reg: 3, dep: 1000.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-02-09', site: 'WFL', streamer: 'Jason', spend: 1192.79, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-02-09', site: 'WFL', streamer: 'GhostWrecker', spend: 1338.73, reg: 28, dep: 37010.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-02-09', site: 'WFL', streamer: 'Neggy', spend: 634.63, reg: 9, dep: 1500.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-02-09', site: 'WFL', streamer: 'Aether', spend: 620.35, reg: 0, dep: 0.00, type: 'Live', link: 'https://www.facebook.com/TeamAetherEsports/videos/' },
  { date: '2026-02-09', site: 'WFL', streamer: 'Aether', spend: 484.47, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/TeamAetherEsports/reels/' },
  { date: '2026-02-09', site: 'WFL', streamer: 'ATO', spend: 470.53, reg: 0, dep: 300.00, type: 'Reels', link: 'https://www.facebook.com/AtoClassSWorldwide/reels/' },
  { date: '2026-02-09', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 4, dep: 4550.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-09', site: 'RLM', streamer: 'Sainty', spend: 915.61, reg: 2, dep: 2921.00, type: 'Reels', link: 'https://www.facebook.com/reels/' },
  { date: '2026-02-09', site: 'RLM', streamer: 'AJ', spend: 5.98, reg: 3, dep: 9267.00, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-02-09', site: 'RLM', streamer: 'Jape', spend: 0, reg: 7, dep: 4965.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-02-09', site: 'RLM', streamer: 'Yuji', spend: 0, reg: 1, dep: 497.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },
  { date: '2026-02-09', site: 'RLM', streamer: 'Pepper', spend: 0, reg: 0, dep: 600.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-02-09', site: 'PP', streamer: 'OSAS', spend: 4581.46, reg: 0, dep: 0, type: 'Reels', link: '' },

  // --- FEB 10 ---
  { date: '2026-02-10', site: 'WFL', streamer: 'GhostWrecker', spend: 1324.17, reg: 3, dep: 2891.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-02-10', site: 'WFL', streamer: 'Jason', spend: 1420.07, reg: 2, dep: 4620.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-02-10', site: 'WFL', streamer: 'Jason', spend: 525.39, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-02-10', site: 'WFL', streamer: 'Neggy', spend: 350.47, reg: 10, dep: 2214.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-02-10', site: 'WFL', streamer: 'Aether', spend: 254.58, reg: 0, dep: 0.00, type: 'Live', link: 'https://www.facebook.com/TeamAetherEsports/videos/' },
  { date: '2026-02-10', site: 'WFL', streamer: 'Aether', spend: 332.82, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/TeamAetherEsports/reels/' },
  { date: '2026-02-10', site: 'WFL', streamer: 'ATO', spend: 244.79, reg: 0, dep: 0.00, type: 'Reels', link: 'https://www.facebook.com/AtoClassSWorldwide/reels/' },
  { date: '2026-02-10', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 5, dep: 8941.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-10', site: 'RLM', streamer: 'AJ', spend: 5.98, reg: 11, dep: 13185.00, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-02-10', site: 'RLM', streamer: 'Jape', spend: 0, reg: 2, dep: 7279.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-02-10', site: 'RLM', streamer: 'Pepper', spend: 0, reg: 0, dep: 2580.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-02-10', site: 'RLM', streamer: 'Sainty', spend: 0, reg: 0, dep: 1000.00, type: 'Reels', link: 'https://www.facebook.com/reels/' },
  { date: '2026-02-10', site: 'PP', streamer: 'OSAS', spend: 2820.63, reg: 0, dep: 0, type: 'Reels', link: '' },

  // --- FEB 11 ---
  { date: '2026-02-11', site: 'WFL', streamer: 'GhostWrecker', spend: 2498.48, reg: 2, dep: 4200.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-02-11', site: 'WFL', streamer: 'Jason', spend: 3355.90, reg: 6, dep: 700.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-02-11', site: 'WFL', streamer: 'Jason', spend: 1139.94, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-02-11', site: 'WFL', streamer: 'Neggy', spend: 1068.21, reg: 26, dep: 3200.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-02-11', site: 'WFL', streamer: 'Neggy', spend: 539.23, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/NeggyTvOfficial/reels/' },
  { date: '2026-02-11', site: 'WFL', streamer: 'Aether', spend: 811.16, reg: 1, dep: 0.00, type: 'Live', link: 'https://www.facebook.com/TeamAetherEsports/videos/' },
  { date: '2026-02-11', site: 'WFL', streamer: 'Aether', spend: 559.34, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/TeamAetherEsports/reels/' },
  { date: '2026-02-11', site: 'WFL', streamer: 'ATO', spend: 516.67, reg: 1, dep: 100.00, type: 'Reels', link: 'https://www.facebook.com/AtoClassSWorldwide/reels/' },
  { date: '2026-02-11', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 2, dep: 6779.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-11', site: 'RLM', streamer: 'AJ', spend: 1364.58, reg: 33, dep: 12834.00, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-02-11', site: 'RLM', streamer: 'Sainty', spend: 594.32, reg: 1, dep: 6960.00, type: 'Reels', link: 'https://www.facebook.com/reels/' },
  { date: '2026-02-11', site: 'RLM', streamer: 'Jape', spend: 0, reg: 1, dep: 2324.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-02-11', site: 'RLM', streamer: 'Pepper', spend: 0, reg: 8, dep: 1270.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-02-11', site: 'RLM', streamer: 'Yuji', spend: 0, reg: 0, dep: 300.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },
  { date: '2026-02-11', site: 'PP', streamer: 'OSAS', spend: 6060.66, reg: 0, dep: 0, type: 'Reels', link: '' },

  // --- FEB 12 ---
  { date: '2026-02-12', site: 'WFL', streamer: 'Jason', spend: 2478.22, reg: 5, dep: 2620.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-02-12', site: 'WFL', streamer: 'Jason', spend: 764.11, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-02-12', site: 'WFL', streamer: 'GhostWrecker', spend: 1607.93, reg: 0, dep: 10000.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-02-12', site: 'WFL', streamer: 'Neggy', spend: 1809.38, reg: 23, dep: 4800.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-02-12', site: 'WFL', streamer: 'Neggy', spend: 1013.33, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/NeggyTvOfficial/reels/' },
  { date: '2026-02-12', site: 'WFL', streamer: 'ATO', spend: 507.95, reg: 1, dep: 200.00, type: 'Reels', link: 'https://www.facebook.com/AtoClassSWorldwide/reels/' },
  { date: '2026-02-12', site: 'WFL', streamer: 'Aether', spend: 324.47, reg: 1, dep: 400.00, type: 'Live', link: 'https://www.facebook.com/TeamAetherEsports/videos/' },
  { date: '2026-02-12', site: 'WFL', streamer: 'Aether', spend: 14.57, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/TeamAetherEsports/reels/' },
  { date: '2026-02-12', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 5, dep: 6525.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-12', site: 'RLM', streamer: 'AJ', spend: 2551.73, reg: 35, dep: 10970.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-02-12', site: 'RLM', streamer: 'AJ', spend: 1919.06, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-02-12', site: 'RLM', streamer: 'Sainty', spend: 1088.08, reg: 1, dep: 2931.00, type: 'Reels', link: 'https://www.facebook.com/reels/' },
  { date: '2026-02-12', site: 'RLM', streamer: 'Jape', spend: 12.61, reg: 3, dep: 2606.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-02-12', site: 'RLM', streamer: 'Pepper', spend: 0, reg: 2, dep: 2100.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-02-12', site: 'RLM', streamer: 'Kim', spend: 0, reg: 0, dep: 500.00, type: 'Live', link: 'https://www.facebook.com/videos/' },
  { date: '2026-02-12', site: 'RLM', streamer: 'Yuji', spend: 0, reg: 0, dep: 100.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },
  { date: '2026-02-12', site: 'PP', streamer: 'OSAS', spend: 3514.94, reg: 0, dep: 0, type: 'Reels', link: '' },

  // --- FEB 13 ---
  { date: '2026-02-13', site: 'WFL', streamer: 'Jason', spend: 1612.91, reg: 1, dep: 1900.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-02-13', site: 'WFL', streamer: 'Jason', spend: 626.03, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-02-13', site: 'WFL', streamer: 'Neggy', spend: 1208.53, reg: 19, dep: 2100.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-02-13', site: 'WFL', streamer: 'Neggy', spend: 911.54, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/NeggyTvOfficial/reels/' },
  { date: '2026-02-13', site: 'WFL', streamer: 'ATO', spend: 194.23, reg: 0, dep: 0.00, type: 'Reels', link: 'https://www.facebook.com/AtoClassSWorldwide/reels/' },
  { date: '2026-02-13', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 6, dep: 6914.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-13', site: 'WFL', streamer: 'GhostWrecker', spend: 0, reg: 3, dep: 4730.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-02-13', site: 'RLM', streamer: 'Sainty', spend: 3576.08, reg: 11, dep: 7696.00, type: 'Live', link: 'https://www.facebook.com/videos/' },
  { date: '2026-02-13', site: 'RLM', streamer: 'Sainty', spend: 818.71, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/reels/' },
  { date: '2026-02-13', site: 'RLM', streamer: 'AJ', spend: 3256.63, reg: 30, dep: 14659.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-02-13', site: 'RLM', streamer: 'AJ', spend: 2355.94, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-02-13', site: 'RLM', streamer: 'Jape', spend: 958.72, reg: 6, dep: 8543.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-02-13', site: 'RLM', streamer: 'Pepper', spend: 0, reg: 0, dep: 3900.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-02-13', site: 'RLM', streamer: 'Yuji', spend: 0, reg: 0, dep: 100.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },
  { date: '2026-02-13', site: 'PP', streamer: 'OSAS', spend: 1597.75, reg: 0, dep: 0, type: 'Reels', link: '' },

  // --- FEB 14 ---
  { date: '2026-02-14', site: 'WFL', streamer: 'Jason', spend: 3297.29, reg: 1, dep: 470.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-02-14', site: 'WFL', streamer: 'Jason', spend: 1166.88, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-02-14', site: 'WFL', streamer: 'Neggy', spend: 1708.60, reg: 36, dep: 1600.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-02-14', site: 'WFL', streamer: 'Neggy', spend: 500.54, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/NeggyTvOfficial/reels/' },
  { date: '2026-02-14', site: 'WFL', streamer: 'GhostWrecker', spend: 543.51, reg: 27, dep: 8650.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-02-14', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 2, dep: 1750.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-14', site: 'WFL', streamer: 'ATO', spend: 0, reg: 1, dep: 200.00, type: 'Live', link: 'https://www.facebook.com/AtoClassSWorldwide/videos/' },
  { date: '2026-02-14', site: 'RLM', streamer: 'Sainty', spend: 6648.36, reg: 34, dep: 14594.00, type: 'Live', link: 'https://www.facebook.com/videos/' },
  { date: '2026-02-14', site: 'RLM', streamer: 'AJ', spend: 1516.77, reg: 16, dep: 18407.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-02-14', site: 'RLM', streamer: 'Jape', spend: 1102.45, reg: 7, dep: 6259.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-02-14', site: 'RLM', streamer: 'Pepper', spend: 0, reg: 1, dep: 10280.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-02-14', site: 'RLM', streamer: 'Kim', spend: 0, reg: 0, dep: 100.00, type: 'Live', link: 'https://www.facebook.com/videos/' },
  { date: '2026-02-14', site: 'RLM', streamer: 'Yuji', spend: 0, reg: 0, dep: 100.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },
  { date: '2026-02-14', site: 'PP', streamer: 'OSAS', spend: 3268.73, reg: 0, dep: 0, type: 'Reels', link: '' },

  // --- FEB 15 ---
  { date: '2026-02-15', site: 'WFL', streamer: 'GhostWrecker', spend: 1277.94, reg: 41, dep: 5761.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-02-15', site: 'WFL', streamer: 'Neggy', spend: 917.13, reg: 27, dep: 1600.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-02-15', site: 'WFL', streamer: 'Jason', spend: 957.48, reg: 0, dep: 3100.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-02-15', site: 'WFL', streamer: 'Jason', spend: 440.35, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-02-15', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 5, dep: 2205.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-15', site: 'WFL', streamer: 'Aether', spend: 0, reg: 1, dep: 100.00, type: 'Live', link: 'https://www.facebook.com/TeamAetherEsports/videos/' },
  { date: '2026-02-15', site: 'RLM', streamer: 'Sainty', spend: 6666.49, reg: 28, dep: 9360.00, type: 'Live', link: 'https://www.facebook.com/videos/' },
  { date: '2026-02-15', site: 'RLM', streamer: 'Yuji', spend: 1250.07, reg: 6, dep: 950.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },
  { date: '2026-02-15', site: 'RLM', streamer: 'Jape', spend: 1039.58, reg: 8, dep: 1807.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-02-15', site: 'RLM', streamer: 'AJ', spend: 0, reg: 5, dep: 9490.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-02-15', site: 'RLM', streamer: 'Pepper', spend: 0, reg: 0, dep: 785.00, type: 'Live', link: 'https://www.facebook.com/AkoSiPepVT/videos/' },
  { date: '2026-02-15', site: 'PP', streamer: 'OSAS', spend: 461.84, reg: 0, dep: 0, type: 'Reels', link: '' },

  // --- FEB 16 ---
  { date: '2026-02-16', site: 'WFL', streamer: 'GhostWrecker', spend: 3477.99, reg: 42, dep: 16800.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-02-16', site: 'WFL', streamer: 'Neggy', spend: 1580.40, reg: 52, dep: 2286.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-02-16', site: 'WFL', streamer: 'Jason', spend: 1524.35, reg: 3, dep: 3800.00, type: 'Live', link: 'https://www.facebook.com/itsmeJ4soon/videos/' },
  { date: '2026-02-16', site: 'WFL', streamer: 'Jason', spend: 872.62, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-02-16', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 2, dep: 3900.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-16', site: 'WFL', streamer: 'Aether', spend: 0, reg: 0, dep: 200.00, type: 'Live', link: 'https://www.facebook.com/TeamAetherEsports/videos/' },
  { date: '2026-02-16', site: 'RLM', streamer: 'AJ', spend: 801.38, reg: 14, dep: 17283.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-02-16', site: 'RLM', streamer: 'AJ', spend: 255.23, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-02-16', site: 'RLM', streamer: 'Jape', spend: 1397.77, reg: 6, dep: 1950.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-02-16', site: 'RLM', streamer: 'Sainty', spend: 643.63, reg: 2, dep: 3666.00, type: 'Reels', link: 'https://www.facebook.com/reels/' },
  { date: '2026-02-16', site: 'RLM', streamer: 'Yuji', spend: 642.79, reg: 2, dep: 800.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },
  { date: '2026-02-16', site: 'PP', streamer: 'OSAS', spend: 1353.81, reg: 0, dep: 0, type: 'Reels', link: '' },

  // --- FEB 17 ---
  { date: '2026-02-17', site: 'WFL', streamer: 'GhostWrecker', spend: 2689.29, reg: 37, dep: 11210.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-02-17', site: 'WFL', streamer: 'Neggy', spend: 1911.41, reg: 64, dep: 6460.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-02-17', site: 'WFL', streamer: 'HolyFather', spend: 1033.64, reg: 15, dep: 3060.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-17', site: 'WFL', streamer: 'Jason', spend: 286.09, reg: 0, dep: 1200.00, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-02-17', site: 'WFL', streamer: 'ATO', spend: 0, reg: 1, dep: 100.00, type: 'Live', link: 'https://www.facebook.com/AtoClassSWorldwide/videos/' },
  { date: '2026-02-17', site: 'RLM', streamer: 'AJ', spend: 1110.34, reg: 17, dep: 9120.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-02-17', site: 'RLM', streamer: 'AJ', spend: 1166.56, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-02-17', site: 'RLM', streamer: 'Jape', spend: 830.70, reg: 4, dep: 13698.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-02-17', site: 'RLM', streamer: 'Sainty', spend: 0, reg: 1, dep: 4460.00, type: 'Live', link: 'https://www.facebook.com/videos/' },
  { date: '2026-02-17', site: 'RLM', streamer: 'Pepper', spend: 0, reg: 0, dep: 857.00, type: 'Reels', link: 'https://www.facebook.com/AkoSiPepVT/reels/' },
  { date: '2026-02-17', site: 'RLM', streamer: 'Yuji', spend: 0, reg: 0, dep: 150.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },
  { date: '2026-02-17', site: 'PP', streamer: 'OSAS', spend: 1093.55, reg: 0, dep: 0, type: 'Reels', link: '' },

  // --- GENERAL/BOOSTING ---
  { date: '2026-02-09', site: 'WFL', streamer: 'General', spend: 631.49, reg: 0, dep: 0, type: 'General', link: '' },
  { date: '2026-02-10', site: 'WFL', streamer: 'General', spend: 3849.97, reg: 0, dep: 0, type: 'General', link: '' },
  { date: '2026-02-11', site: 'WFL', streamer: 'General', spend: 282.45, reg: 0, dep: 0, type: 'General', link: '' },
  { date: '2026-02-12', site: 'WFL', streamer: 'General', spend: 845.82, reg: 0, dep: 0, type: 'General', link: '' },
  { date: '2026-02-13', site: 'WFL', streamer: 'General', spend: 808.27, reg: 0, dep: 0, type: 'General', link: '' },
];

// Helper: split array into chunks for Firestore batch (max 500 ops)
function chunkArray(arr, size = 400) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

export default function App() {
  // --- DATA STATE ---
  // MODE A (no Firebase): loads rawData + any localStorage additions immediately
  // MODE B (Firebase configured): real-time Firestore sync across all devices
  const [data, setData] = useState(() => {
    if (FIREBASE_CONFIGURED) return [];
    try {
      const saved = localStorage.getItem('campaignData');
      return saved ? JSON.parse(saved) : rawData;
    } catch { return rawData; }
  });
  const [loading, setLoading] = useState(FIREBASE_CONFIGURED);

  // Persist to localStorage in offline mode
  useEffect(() => {
    if (!FIREBASE_CONFIGURED) {
      localStorage.setItem('campaignData', JSON.stringify(data));
    }
  }, [data]);

  // Firebase mode: real-time listener + auto-seed on first run
  useEffect(() => {
    if (!FIREBASE_CONFIGURED) return;
    const unsub = onSnapshot(collection(db, 'entries'), async (snapshot) => {
      if (snapshot.empty) {
        for (const chunk of chunkArray(rawData)) {
          const batch = writeBatch(db);
          chunk.forEach(entry => batch.set(doc(collection(db, 'entries')), entry));
          await batch.commit();
        }
        return;
      }
      const entries = snapshot.docs
        .map(d => ({ ...d.data(), id: d.id }))
        .sort((a, b) => a.date.localeCompare(b.date));
      setData(entries);
      setLoading(false);
    });
    return unsub;
  }, []);

  // --- VIEW STATE ---
  const [activeView, setActiveView] = useState('dashboard');

  // --- ADS REPORT DATA ---
  const [adsReportData, setAdsReportData] = useState(() => {
    if (FIREBASE_CONFIGURED) return {};
    try {
      const saved = localStorage.getItem('adsReportData');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // Persist adsReportData to localStorage in offline mode
  useEffect(() => {
    if (!FIREBASE_CONFIGURED) {
      localStorage.setItem('adsReportData', JSON.stringify(adsReportData));
    }
  }, [adsReportData]);

  // Firebase mode: real-time adsReport listener
  useEffect(() => {
    if (!FIREBASE_CONFIGURED) return;
    const unsub = onSnapshot(doc(db, 'config', 'adsReport'), (snap) => {
      if (snap.exists()) setAdsReportData(snap.data());
    });
    return unsub;
  }, []);

  // --- CREATOR PERF DATA ---
  const [creatorPerfData, setCreatorPerfData] = useState(() => {
    if (FIREBASE_CONFIGURED) return {};
    try {
      const saved = localStorage.getItem('creatorPerfData');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    if (!FIREBASE_CONFIGURED) {
      localStorage.setItem('creatorPerfData', JSON.stringify(creatorPerfData));
    }
  }, [creatorPerfData]);

  useEffect(() => {
    if (!FIREBASE_CONFIGURED) return;
    const unsub = onSnapshot(doc(db, 'config', 'creatorPerf'), (snap) => {
      if (snap.exists()) setCreatorPerfData(snap.data());
    });
    return unsub;
  }, []);

  // --- ADS EDIT MODAL STATE ---
  const [showAdsModal, setShowAdsModal] = useState(false);
  const [adsEditKey, setAdsEditKey] = useState(null);
  const [adsEditLabel, setAdsEditLabel] = useState('');
  const emptyAdsForm = { ggr: '', bonus: '', ngr: '', boosting: '' };
  const [adsFormValues, setAdsFormValues] = useState(emptyAdsForm);

  const openAdsEditModal = (site, streamer, type, label) => {
    const key = `${site}|${streamer}|${type}`;
    setAdsEditKey(key);
    setAdsEditLabel(label);
    const existing = adsReportData[key] || {};
    setAdsFormValues({
      ggr: existing.ggr !== undefined ? String(existing.ggr) : '',
      bonus: existing.bonus !== undefined ? String(existing.bonus) : '',
      ngr: existing.ngr !== undefined ? String(existing.ngr) : '',
      boosting: existing.boosting !== undefined ? String(existing.boosting) : '',
    });
    setShowAdsModal(true);
  };

  const handleAdsSave = async () => {
    const updated = {
      ...adsReportData,
      [adsEditKey]: {
        ggr: parseFloat(adsFormValues.ggr) || 0,
        bonus: parseFloat(adsFormValues.bonus) || 0,
        ngr: parseFloat(adsFormValues.ngr) || 0,
        boosting: parseFloat(adsFormValues.boosting) || 0,
      },
    };
    if (FIREBASE_CONFIGURED) {
      await setDoc(doc(db, 'config', 'adsReport'), updated);
    } else {
      setAdsReportData(updated);
    }
    setShowAdsModal(false);
  };

  // --- CREATOR PERF MODAL STATE ---
  const [showCreatorPerfModal, setShowCreatorPerfModal] = useState(false);
  const [creatorPerfEditKey, setCreatorPerfEditKey] = useState(null);
  const [creatorPerfLabel, setCreatorPerfLabel] = useState('');
  const emptyCreatorPerfForm = { ggr: '', bonus: '', ngr: '' };
  const [creatorPerfFormValues, setCreatorPerfFormValues] = useState(emptyCreatorPerfForm);

  const openCreatorPerfModal = (date, streamer, site) => {
    const key = `${date}|${streamer}|${site}`;
    setCreatorPerfEditKey(key);
    setCreatorPerfLabel(`${streamer} — ${date} — ${site}`);
    const existing = creatorPerfData[key] || {};
    setCreatorPerfFormValues({
      ggr: existing.ggr !== undefined ? String(existing.ggr) : '',
      bonus: existing.bonus !== undefined ? String(existing.bonus) : '',
      ngr: existing.ngr !== undefined ? String(existing.ngr) : '',
    });
    setShowCreatorPerfModal(true);
  };

  const handleCreatorPerfSave = async () => {
    const updated = {
      ...creatorPerfData,
      [creatorPerfEditKey]: {
        ggr: parseFloat(creatorPerfFormValues.ggr) || 0,
        bonus: parseFloat(creatorPerfFormValues.bonus) || 0,
        ngr: parseFloat(creatorPerfFormValues.ngr) || 0,
      },
    };
    if (FIREBASE_CONFIGURED) {
      await setDoc(doc(db, 'config', 'creatorPerf'), updated);
    } else {
      setCreatorPerfData(updated);
    }
    setShowCreatorPerfModal(false);
  };

  // --- MODAL STATE ---
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // Firestore id OR array index
  const emptyForm = { date: new Date().toISOString().split('T')[0], site: 'WFL', streamer: '', spend: '', reg: '', dep: '', type: 'Live', link: '' };
  const [formValues, setFormValues] = useState(emptyForm);

  const openAddModal = () => {
    setEditingId(null);
    setFormValues({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    // Firebase mode: use doc id; offline mode: use array index
    setEditingId(FIREBASE_CONFIGURED ? item.id : data.indexOf(item));
    const { id: _id, ...rest } = item;
    setFormValues({ ...rest, spend: String(item.spend), reg: String(item.reg), dep: String(item.dep) });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formValues.date || !formValues.streamer) return;
    const { id: _id, ...formClean } = formValues;
    const entry = { ...formClean, spend: parseFloat(formClean.spend) || 0, reg: parseInt(formClean.reg) || 0, dep: parseFloat(formClean.dep) || 0 };
    if (FIREBASE_CONFIGURED) {
      if (editingId !== null) {
        await updateDoc(doc(db, 'entries', editingId), entry);
      } else {
        await addDoc(collection(db, 'entries'), entry);
      }
    } else {
      if (editingId !== null) {
        const updated = [...data];
        updated[editingId] = entry;
        setData(updated);
      } else {
        setData(prev => [...prev, entry]);
      }
    }
    setShowModal(false);
  };

  const handleDelete = async (item) => {
    if (window.confirm('Delete this entry?')) {
      if (FIREBASE_CONFIGURED) {
        await deleteDoc(doc(db, 'entries', item.id));
      } else {
        setData(prev => prev.filter(d => d !== item));
      }
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all data back to the original? All added entries will be lost.')) {
      if (FIREBASE_CONFIGURED) {
        const snapshot = await getDocs(collection(db, 'entries'));
        for (const chunk of chunkArray(snapshot.docs)) {
          const batch = writeBatch(db);
          chunk.forEach(d => batch.delete(d.ref));
          await batch.commit();
        }
        for (const chunk of chunkArray(rawData)) {
          const batch = writeBatch(db);
          chunk.forEach(entry => batch.set(doc(collection(db, 'entries')), entry));
          await batch.commit();
        }
      } else {
        setData(rawData);
      }
    }
  };

  const uniqueDates = [...new Set(data.map(d => d.date))].sort();
  const minDate = uniqueDates[0];
  const maxDate = uniqueDates[uniqueDates.length - 1];

  const [filterSite, setFilterSite] = useState('All');
  const [filterStreamer, setFilterStreamer] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [startDate, setStartDate] = useState(minDate);
  const [endDate, setEndDate] = useState(maxDate);

  // --- DERIVED METRICS ---
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const siteMatch = filterSite === 'All' || item.site === filterSite;
      const streamerMatch = filterStreamer === 'All' || item.streamer === filterStreamer;
      const typeMatch = filterType === 'All' || item.type === filterType;
      const dateMatch = item.date >= startDate && item.date <= endDate;
      return siteMatch && streamerMatch && typeMatch && dateMatch;
    });
  }, [filterSite, filterStreamer, filterType, startDate, endDate]);

  // Total Metrics
  const totals = useMemo(() => {
    return filteredData.reduce((acc, curr) => ({
      spend: acc.spend + curr.spend,
      reg: acc.reg + curr.reg,
      dep: acc.dep + curr.dep,
    }), { spend: 0, reg: 0, dep: 0 });
  }, [filteredData]);

  // Group by Streamer for Summary Table
  const streamerSummary = useMemo(() => {
    const summary = {};
    filteredData.forEach(item => {
      if (!summary[item.streamer]) {
        summary[item.streamer] = { 
          name: item.streamer, 
          site: item.site, 
          spend: 0, 
          reg: 0, 
          dep: 0,
          liveCount: 0,
          reelsCount: 0
        };
      }
      summary[item.streamer].spend += item.spend;
      summary[item.streamer].reg += item.reg;
      summary[item.streamer].dep += item.dep;
      
      if (item.type === 'Live') summary[item.streamer].liveCount += 1;
      if (item.type === 'Reels') summary[item.streamer].reelsCount += 1;
    });
    return Object.values(summary).sort((a, b) => b.dep - a.dep); 
  }, [filteredData]);

  // Chart Data (Daily Totals)
  const chartData = useMemo(() => {
    const daily = {};
    filteredData.forEach(item => {
      if (!daily[item.date]) daily[item.date] = { date: item.date, spend: 0, dep: 0 };
      daily[item.date].spend += item.spend;
      daily[item.date].dep += item.dep;
    });
    return Object.values(daily).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredData]);

  // Format currency
  const formatPHP = (val) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);
  const formatNum = (val) => new Intl.NumberFormat('en-US').format(val);

  // Calculate ROI
  const getROI = (spend, dep) => {
    if (spend === 0) return dep > 0 ? 1000 : 0; 
    return ((dep - spend) / spend) * 100;
  };

  const totalROI = getROI(totals.spend, totals.dep);

  const streamers = [...new Set(data.map(d => d.streamer))].sort();
  const sites = [...new Set(data.map(d => d.site))].sort();
  const types = ["Live", "Reels", "General"];

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      
      {/* STICKY HEADER WRAPPER */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 md:px-8 space-y-3">
          
          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-indigo-900 tracking-tight">Campaign Performance</h1>
              <button onClick={openAddModal} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={14} /> Add Entry
              </button>
              <button onClick={handleResetData} className="flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                Reset Data
              </button>
              {loading && FIREBASE_CONFIGURED && (
                <span className="text-xs text-slate-400 animate-pulse">Syncing...</span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex gap-2 items-center bg-white p-1.5 rounded-lg shadow-sm border border-slate-200">
                 <div className="flex items-center px-2 text-slate-400">
                    <Calendar size={16} />
                 </div>
                 <input
                    type="date"
                    value={startDate}
                    min={minDate}
                    max={endDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-xs md:text-sm font-medium focus:outline-none text-slate-700 w-24 md:w-auto"
                 />
                 <span className="text-slate-300">-</span>
                 <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    max={maxDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-xs md:text-sm font-medium focus:outline-none text-slate-700 w-24 md:w-auto"
                 />
              </div>

              <div className="flex gap-2 bg-white p-1.5 rounded-lg shadow-sm border border-slate-200">
                <div className="flex items-center px-2 text-slate-400">
                  <Filter size={16} />
                </div>
                <select 
                  value={filterSite} 
                  onChange={(e) => setFilterSite(e.target.value)}
                  className="bg-transparent text-xs md:text-sm font-medium focus:outline-none text-slate-700"
                >
                  <option value="All">All Sites</option>
                  {sites.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="w-px bg-slate-200 mx-1"></div>
                <select 
                  value={filterStreamer} 
                  onChange={(e) => setFilterStreamer(e.target.value)}
                  className="bg-transparent text-xs md:text-sm font-medium focus:outline-none text-slate-700 max-w-[100px] md:max-w-none truncate"
                >
                  <option value="All">All Streamers</option>
                  {streamers.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="w-px bg-slate-200 mx-1"></div>
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent text-xs md:text-sm font-medium focus:outline-none text-slate-700"
                >
                  <option value="All">All Formats</option>
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </header>

          {/* TAB NAVIGATION */}
          <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeView === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <TrendingUp size={13}/> Dashboard
            </button>
            <button
              onClick={() => setActiveView('adsReport')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeView === 'adsReport' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <BarChart2 size={13}/> Ads Report
            </button>
            <button
              onClick={() => setActiveView('creatorReport')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeView === 'creatorReport' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Activity size={13}/> Creator Report
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard 
              title="Total Spend" 
              value={formatPHP(totals.spend)} 
              icon={<ArrowDownRight className="text-red-500" size={16} />} 
              color="border-l-4 border-red-500"
            />
            <MetricCard 
              title="Total Deposits" 
              value={formatPHP(totals.dep)} 
              icon={<ArrowUpRight className="text-emerald-500" size={16} />} 
              color="border-l-4 border-emerald-500"
            />
            <MetricCard 
              title="Net Revenue" 
              value={formatPHP(totals.dep - totals.spend)} 
              icon={<DollarSign className="text-indigo-500" size={16} />} 
              color="border-l-4 border-indigo-500"
            />
            <MetricCard 
              title="Total ROI" 
              value={`${totalROI.toFixed(2)}%`} 
              icon={<TrendingUp className={totalROI >= 0 ? "text-emerald-600" : "text-red-600"} size={16} />} 
              subValue={`${formatNum(totals.reg)} Registers`}
              color={totalROI >= 0 ? "border-l-4 border-emerald-600" : "border-l-4 border-red-600"}
            />
          </div>
        </div>
      </div>

      {activeView === 'dashboard' && (
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-slate-400"/>
            Daily Financial Trend
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(str) => {
                    const d = new Date(str);
                    return `${d.getMonth()+1}/${d.getDate()}`;
                  }} 
                  stroke="#64748b"
                  tick={{fontSize: 12}}
                />
                <YAxis stroke="#64748b" tick={{fontSize: 12}} tickFormatter={(val) => `₱${val/1000}k`}/>
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value) => formatPHP(value)}
                />
                <Legend />
                <Line type="monotone" dataKey="spend" name="Ad Spend" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="dep" name="Deposits" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Users size={20} className="text-slate-400"/>
              Streamer ROI Leaderboard
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Streamer</th>
                  <th className="p-4 font-semibold">Site</th>
                  <th className="p-4 font-semibold text-center">Lives (Days)</th>
                  <th className="p-4 font-semibold text-center">Reels (Days)</th>
                  <th className="p-4 font-semibold text-right">Spend</th>
                  <th className="p-4 font-semibold text-right">Registers</th>
                  <th className="p-4 font-semibold text-right">Deposits</th>
                  <th className="p-4 font-semibold text-right">Net Profit</th>
                  <th className="p-4 font-semibold text-right">ROI %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {streamerSummary.map((item, idx) => {
                  const roi = getROI(item.spend, item.dep);
                  const net = item.dep - item.spend;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-medium text-slate-900">{item.name}</td>
                      <td className="p-4 text-slate-500">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          item.site === 'WFL' ? 'bg-blue-100 text-blue-700' : 
                          item.site === 'RLM' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {item.site}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-600">
                          <Radio size={14} className="text-red-500"/>
                          {item.liveCount}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-600">
                          <Video size={14} className="text-blue-500"/>
                          {item.reelsCount}
                        </div>
                      </td>
                      <td className="p-4 text-right text-slate-600">{formatPHP(item.spend)}</td>
                      <td className="p-4 text-right text-slate-600">{formatNum(item.reg)}</td>
                      <td className="p-4 text-right font-medium text-slate-900">{formatPHP(item.dep)}</td>
                      <td className={`p-4 text-right font-medium ${net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {net >= 0 ? '+' : ''}{formatPHP(net)}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          roi >= 100 ? 'bg-emerald-100 text-emerald-800' :
                          roi >= 0 ? 'bg-indigo-50 text-indigo-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {roi.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800">Daily Transaction Log</h3>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <tr className="text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-3 font-semibold w-16"></th>
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold">Site</th>
                  <th className="p-3 font-semibold">Streamer</th>
                  <th className="p-3 font-semibold">Format</th>
                  <th className="p-3 font-semibold">Link</th>
                  <th className="p-3 font-semibold text-right">Spend</th>
                  <th className="p-3 font-semibold text-right">Registers</th>
                  <th className="p-3 font-semibold text-right">Deposits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEditModal(item)} className="p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Edit"><Edit2 size={13}/></button>
                        <button onClick={() => handleDelete(item)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={13}/></button>
                      </div>
                    </td>
                    <td className="p-3 text-slate-500 whitespace-nowrap">{item.date}</td>
                    <td className="p-3 text-slate-500">{item.site}</td>
                    <td className="p-3 font-medium text-slate-700">{item.streamer}</td>
                    <td className="p-3 text-slate-500">
                      <span className={`px-2 py-0.5 rounded text-xs border ${
                        item.type === 'Live' ? 'bg-red-50 text-red-600 border-red-100' :
                        item.type === 'Reels' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        item.type === 'General' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                        'bg-purple-50 text-purple-600 border-purple-100'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3">
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium">
                          <ExternalLink size={14} /> <span className="text-xs whitespace-nowrap">View URL</span>
                        </a>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-3 text-right text-slate-600">{formatPHP(item.spend)}</td>
                    <td className="p-3 text-right text-slate-600">{item.reg}</td>
                    <td className="p-3 text-right font-medium text-emerald-600">{formatPHP(item.dep)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      )}

      {activeView === 'adsReport' && (
        <AdsReportView
          filteredData={filteredData}
          adsReportData={adsReportData}
          onEdit={openAdsEditModal}
          formatPHP={formatPHP}
          formatNum={formatNum}
        />
      )}

      {activeView === 'creatorReport' && (
        <CreatorReportView
          data={data}
          startDate={startDate}
          endDate={endDate}
          creatorPerfData={creatorPerfData}
          onEdit={openCreatorPerfModal}
          formatPHP={formatPHP}
          streamers={streamers}
          sites={sites}
        />
      )}

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-800">{editingId !== null ? 'Edit Entry' : 'Add New Entry'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</label>
                  <input type="date" value={formValues.date} onChange={e => setFormValues({...formValues, date: e.target.value})} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Site</label>
                  <select value={formValues.site} onChange={e => setFormValues({...formValues, site: e.target.value})} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option>WFL</option><option>RLM</option><option>PP</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Streamer</label>
                  <input type="text" value={formValues.streamer} onChange={e => setFormValues({...formValues, streamer: e.target.value})} placeholder="e.g. HolyFather" list="streamer-suggestions" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                  <datalist id="streamer-suggestions">
                    {streamers.map(s => <option key={s} value={s}/>)}
                  </datalist>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</label>
                  <select value={formValues.type} onChange={e => setFormValues({...formValues, type: e.target.value})} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option>Live</option><option>Reels</option><option>General</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Spend (₱)</label>
                  <input type="number" value={formValues.spend} onChange={e => setFormValues({...formValues, spend: e.target.value})} placeholder="0" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Registers</label>
                  <input type="number" value={formValues.reg} onChange={e => setFormValues({...formValues, reg: e.target.value})} placeholder="0" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Deposits (₱)</label>
                  <input type="number" value={formValues.dep} onChange={e => setFormValues({...formValues, dep: e.target.value})} placeholder="0" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Link (optional)</label>
                <input type="text" value={formValues.link} onChange={e => setFormValues({...formValues, link: e.target.value})} placeholder="https://..." className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} disabled={!formValues.date || !formValues.streamer} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg text-sm transition-colors">
                {editingId !== null ? 'Save Changes' : 'Add Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADS REPORT EDIT MODAL */}
      {showAdsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowAdsModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Edit GGR Data</h2>
              <button onClick={() => setShowAdsModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 mb-4">
              <p className="text-xs font-bold text-indigo-700 tracking-wider">{adsEditLabel}</p>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">GGR</label>
                  <input type="number" value={adsFormValues.ggr} onChange={e => setAdsFormValues({...adsFormValues, ggr: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bonus</label>
                  <input type="number" value={adsFormValues.bonus} onChange={e => setAdsFormValues({...adsFormValues, bonus: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">NGR</label>
                  <input type="number" value={adsFormValues.ngr} onChange={e => setAdsFormValues({...adsFormValues, ngr: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Boosting</label>
                  <input type="number" value={adsFormValues.boosting} onChange={e => setAdsFormValues({...adsFormValues, boosting: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdsModal(false)} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={handleAdsSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATOR PERF EDIT MODAL */}
      {showCreatorPerfModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowCreatorPerfModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Edit Daily GGR Data</h2>
              <button onClick={() => setShowCreatorPerfModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 mb-4">
              <p className="text-xs font-bold text-indigo-700 tracking-wider">{creatorPerfLabel}</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">GGR (Win/Loss)</label>
                <input type="number" value={creatorPerfFormValues.ggr} onChange={e => setCreatorPerfFormValues({...creatorPerfFormValues, ggr: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bonus</label>
                <input type="number" value={creatorPerfFormValues.bonus} onChange={e => setCreatorPerfFormValues({...creatorPerfFormValues, bonus: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">NGR (Net Gaming Revenue)</label>
                <input type="number" value={creatorPerfFormValues.ngr} onChange={e => setCreatorPerfFormValues({...creatorPerfFormValues, ngr: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                <p className="text-[10px] text-slate-400 mt-1">Efficacy Rate = NGR ÷ Ad Spend</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreatorPerfModal(false)} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreatorPerfSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, subValue, icon, color }) {
  return (
    <div className={`bg-white p-3 rounded-xl shadow-sm border-t border-r border-b border-slate-200 ${color} flex flex-col justify-between`}>
      <div className="flex justify-between items-start mb-1">
        <span className="text-slate-500 text-xs font-bold uppercase tracking-wide truncate pr-2">{title}</span>
        <div className="p-1.5 bg-slate-50 rounded-md scale-90">{icon}</div>
      </div>
      <div>
        <div className="text-lg md:text-xl font-bold text-slate-900 leading-tight">{value}</div>
        {subValue && <div className="text-[10px] font-medium text-slate-400">{subValue}</div>}
      </div>
    </div>
  );
}

function AdsReportView({ filteredData, adsReportData, onEdit, formatNum }) {
  // Group: site → streamer → type → { reg, dep }
  const grouped = {};
  filteredData.forEach(item => {
    if (item.type === 'General') return;
    if (!grouped[item.site]) grouped[item.site] = {};
    if (!grouped[item.site][item.streamer]) grouped[item.site][item.streamer] = { Live: { reg: 0, dep: 0 }, Reels: { reg: 0, dep: 0 } };
    if (item.type === 'Live') {
      grouped[item.site][item.streamer].Live.reg += item.reg;
      grouped[item.site][item.streamer].Live.dep += item.dep;
    } else if (item.type === 'Reels') {
      grouped[item.site][item.streamer].Reels.reg += item.reg;
      grouped[item.site][item.streamer].Reels.dep += item.dep;
    }
  });

  const SITE_LABELS = { WFL: 'WINFORLIFE', RLM: 'ROLLEM', PP: 'PLENTIFUL PLAY' };
  const getAds = (site, streamer, type) => adsReportData[`${site}|${streamer}|${type}`] || { ggr: 0, bonus: 0, ngr: 0, boosting: 0 };

  const fmtVal = (val) => {
    const n = parseFloat(val) || 0;
    if (n === 0) return '0';
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  };

  const siteOrder = ['WFL', 'RLM', 'PP'].filter(s => grouped[s]);

  // Pre-compute aggregates
  const siteData = siteOrder.map(site => {
    const streamers = Object.keys(grouped[site]).sort((a, b) =>
      (grouped[site][b].Live.reg + grouped[site][b].Reels.reg) -
      (grouped[site][a].Live.reg + grouped[site][a].Reels.reg)
    );
    const streamerData = streamers.map(streamer => {
      const liveStats = grouped[site][streamer].Live;
      const reelsStats = grouped[site][streamer].Reels;
      const liveAds = getAds(site, streamer, 'Live');
      const reelsAds = getAds(site, streamer, 'Reels');
      return {
        streamer, liveStats, reelsStats, liveAds, reelsAds,
        totalReg: liveStats.reg + reelsStats.reg,
        totalDep: liveStats.dep + reelsStats.dep,
        totalGGR: liveAds.ggr + reelsAds.ggr,
        totalBonus: liveAds.bonus + reelsAds.bonus,
        totalNGR: liveAds.ngr + reelsAds.ngr,
        totalBoosting: liveAds.boosting + reelsAds.boosting,
      };
    });
    const siteTotal = streamerData.reduce((acc, s) => ({
      reg: acc.reg + s.totalReg, dep: acc.dep + s.totalDep,
      ggr: acc.ggr + s.totalGGR, bonus: acc.bonus + s.totalBonus,
      ngr: acc.ngr + s.totalNGR, boosting: acc.boosting + s.totalBoosting,
    }), { reg: 0, dep: 0, ggr: 0, bonus: 0, ngr: 0, boosting: 0 });
    return { site, streamerData, siteTotal };
  });

  const grandTotal = siteData.reduce((acc, s) => ({
    reg: acc.reg + s.siteTotal.reg, dep: acc.dep + s.siteTotal.dep,
    ggr: acc.ggr + s.siteTotal.ggr, bonus: acc.bonus + s.siteTotal.bonus,
    ngr: acc.ngr + s.siteTotal.ngr, boosting: acc.boosting + s.siteTotal.boosting,
  }), { reg: 0, dep: 0, ggr: 0, bonus: 0, ngr: 0, boosting: 0 });

  const ColHeader = () => (
    <tr className="bg-slate-50/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
      <th className="px-4 py-2 text-left font-semibold w-44">Campaign</th>
      <th className="px-4 py-2 text-right font-semibold">REG ▼</th>
      <th className="px-4 py-2 text-right font-semibold">Deposits</th>
      <th className="px-4 py-2 text-right font-semibold">GGR</th>
      <th className="px-4 py-2 text-right font-semibold">Bonus</th>
      <th className="px-4 py-2 text-right font-semibold">NGR</th>
      <th className="px-4 py-2 text-right font-semibold">Boosting</th>
    </tr>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">
      {siteData.map(({ site, streamerData, siteTotal }) => {
        const label = SITE_LABELS[site] || site;
        const colorCls = site === 'WFL' ? 'bg-blue-600' : site === 'RLM' ? 'bg-purple-600' : 'bg-orange-600';
        return (
          <div key={site} className="space-y-4">
            {/* Site Header */}
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-xl ${colorCls} text-white font-bold text-sm tracking-wider shadow-sm`}>{label}</div>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Per-Streamer Cards */}
            {streamerData.map(({ streamer, liveStats, reelsStats, liveAds, reelsAds, totalReg, totalDep, totalGGR, totalBonus, totalNGR, totalBoosting }) => {
              const lbl = streamer.toUpperCase();
              const hasLive = liveStats.reg > 0 || liveStats.dep > 0;
              const hasReels = reelsStats.reg > 0 || reelsStats.dep > 0;
              return (
                <div key={streamer} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-slate-700 tracking-wide text-sm">{lbl}</span>
                    <div className="flex gap-2">
                      {hasLive && (
                        <button onClick={() => onEdit(site, streamer, 'Live', `${lbl}AD`)} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors font-medium">
                          <Edit2 size={11}/> Edit AD
                        </button>
                      )}
                      {hasReels && (
                        <button onClick={() => onEdit(site, streamer, 'Reels', `${lbl}REEL`)} className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-2.5 py-1 rounded-lg transition-colors font-medium">
                          <Edit2 size={11}/> Edit REEL
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><ColHeader /></thead>
                      <tbody className="divide-y divide-slate-50">
                        {hasLive && (
                          <tr className="hover:bg-red-50/30 transition-colors">
                            <td className="px-4 py-2.5 font-medium text-slate-700">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span>{lbl}AD
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right text-slate-600">{formatNum(liveStats.reg)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-600">{fmtVal(liveStats.dep)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-500">{fmtVal(liveAds.ggr)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-500">{fmtVal(liveAds.bonus)}</td>
                            <td className={`px-4 py-2.5 text-right font-medium ${liveAds.ngr >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtVal(liveAds.ngr)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-500">{fmtVal(liveAds.boosting)}</td>
                          </tr>
                        )}
                        {hasReels && (
                          <tr className="hover:bg-violet-50/30 transition-colors">
                            <td className="px-4 py-2.5 font-medium text-slate-700">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-violet-400 inline-block"></span>{lbl}REEL
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right text-slate-600">{formatNum(reelsStats.reg)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-600">{fmtVal(reelsStats.dep)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-500">{fmtVal(reelsAds.ggr)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-500">{fmtVal(reelsAds.bonus)}</td>
                            <td className={`px-4 py-2.5 text-right font-medium ${reelsAds.ngr >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtVal(reelsAds.ngr)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-500">{fmtVal(reelsAds.boosting)}</td>
                          </tr>
                        )}
                        <tr className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-700">
                          <td className="px-4 py-2.5 text-xs uppercase text-slate-400 tracking-wider">Total</td>
                          <td className="px-4 py-2.5 text-right">{formatNum(totalReg)}</td>
                          <td className="px-4 py-2.5 text-right">{fmtVal(totalDep)}</td>
                          <td className="px-4 py-2.5 text-right">{fmtVal(totalGGR)}</td>
                          <td className="px-4 py-2.5 text-right">{fmtVal(totalBonus)}</td>
                          <td className={`px-4 py-2.5 text-right ${totalNGR >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtVal(totalNGR)}</td>
                          <td className="px-4 py-2.5 text-right">{fmtVal(totalBoosting)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            {/* Site Total Row */}
            <div className="bg-white rounded-xl border-2 border-slate-300 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-bold">
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 text-slate-800 w-44 tracking-wider">{label} TOTAL</td>
                      <td className="px-4 py-3 text-right text-slate-800">{formatNum(siteTotal.reg)}</td>
                      <td className="px-4 py-3 text-right text-slate-800">{fmtVal(siteTotal.dep)}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{fmtVal(siteTotal.ggr)}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{fmtVal(siteTotal.bonus)}</td>
                      <td className={`px-4 py-3 text-right ${siteTotal.ngr >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtVal(siteTotal.ngr)}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{fmtVal(siteTotal.boosting)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}

      {/* Grand Total */}
      {siteData.length > 1 && (
        <div className="bg-indigo-900 text-white rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-bold">
              <tbody>
                <tr>
                  <td className="px-4 py-4 w-44 tracking-wider">TOTAL {siteOrder.join(' & ')}</td>
                  <td className="px-4 py-4 text-right">{formatNum(grandTotal.reg)}</td>
                  <td className="px-4 py-4 text-right">{fmtVal(grandTotal.dep)}</td>
                  <td className="px-4 py-4 text-right opacity-90">{fmtVal(grandTotal.ggr)}</td>
                  <td className="px-4 py-4 text-right opacity-90">{fmtVal(grandTotal.bonus)}</td>
                  <td className={`px-4 py-4 text-right ${grandTotal.ngr >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{fmtVal(grandTotal.ngr)}</td>
                  <td className="px-4 py-4 text-right opacity-90">{fmtVal(grandTotal.boosting)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
function CreatorReportView({ data, startDate, endDate, creatorPerfData, onEdit, formatPHP, streamers, sites }) {
  const [selectedStreamer, setSelectedStreamer] = React.useState(streamers[0] || '');
  const [selectedSite, setSelectedSite] = React.useState('All');

  // Filter data for the selected creator
  const creatorEntries = data.filter(d =>
    d.streamer === selectedStreamer &&
    d.date >= startDate &&
    d.date <= endDate &&
    (selectedSite === 'All' || d.site === selectedSite)
  );

  // Get dates where this creator has entries
  const creatorDates = [...new Set(creatorEntries.map(d => d.date))].sort();

  // Build per-day rows
  const rows = creatorDates.map(date => {
    const dayEntries = creatorEntries.filter(e => e.date === date);
    const totalSpend = dayEntries.reduce((s, e) => s + e.spend, 0);
    const totalDep = dayEntries.reduce((s, e) => s + e.dep, 0);
    const totalReg = dayEntries.reduce((s, e) => s + e.reg, 0);
    const siteName = dayEntries[0]?.site || '';
    const key = `${date}|${selectedStreamer}|${siteName}`;
    const perf = creatorPerfData[key] || { ggr: 0, bonus: 0, ngr: 0 };
    const efficacyRate = totalSpend > 0 ? (perf.ngr / totalSpend) * 100 : null;
    return { date, siteName, totalSpend, totalDep, totalReg, ...perf, efficacyRate, key };
  });

  // Totals
  const totals = rows.reduce((acc, r) => ({
    spend: acc.spend + r.totalSpend,
    dep: acc.dep + r.totalDep,
    reg: acc.reg + r.totalReg,
    ggr: acc.ggr + (r.ggr || 0),
    bonus: acc.bonus + (r.bonus || 0),
    ngr: acc.ngr + (r.ngr || 0),
  }), { spend: 0, dep: 0, reg: 0, ggr: 0, bonus: 0, ngr: 0 });

  const totalEfficacy = totals.spend > 0 ? (totals.ngr / totals.spend) * 100 : null;

  const fmtVal = (n) => {
    const v = parseFloat(n) || 0;
    if (v === 0) return <span className="text-slate-300">—</span>;
    const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(v));
    return v < 0 ? <span className="text-red-500">-{formatted}</span> : formatted;
  };

  const fmtDate = (str) => {
    const d = new Date(str + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const efficacyColor = (val) => {
    if (val === null) return 'text-slate-300';
    if (val >= 100) return 'text-emerald-600 font-bold';
    if (val >= 50) return 'text-amber-500 font-semibold';
    return 'text-red-500 font-semibold';
  };

  const siteColors = { WFL: 'bg-blue-100 text-blue-700', RLM: 'bg-purple-100 text-purple-700', PP: 'bg-orange-100 text-orange-700' };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-start">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
          <Activity size={16} className="text-indigo-400" />
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Creator</label>
          <select
            value={selectedStreamer}
            onChange={e => setSelectedStreamer(e.target.value)}
            className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
          >
            {streamers.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Site</label>
          <select
            value={selectedSite}
            onChange={e => setSelectedSite(e.target.value)}
            className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Sites</option>
            {sites.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Summary cards */}
        <div className="flex gap-2 ml-auto flex-wrap">
          {[
            { label: 'Total Ad Spend', val: formatPHP(totals.spend), color: 'border-red-400' },
            { label: 'Total Deposit', val: formatPHP(totals.dep), color: 'border-emerald-400' },
            { label: 'Total NGR', val: formatPHP(totals.ngr), color: totals.ngr >= 0 ? 'border-indigo-400' : 'border-red-400' },
            { label: 'Efficacy Rate', val: totalEfficacy !== null ? `${totalEfficacy.toFixed(2)}%` : '—', color: totalEfficacy !== null && totalEfficacy >= 100 ? 'border-emerald-500' : 'border-amber-400' },
          ].map(c => (
            <div key={c.label} className={`bg-white border-l-4 ${c.color} border-t border-r border-b border-slate-200 rounded-xl px-4 py-2 shadow-sm min-w-[120px]`}>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{c.label}</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">{c.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <span className="text-lg font-bold text-slate-800 uppercase tracking-wide">{selectedStreamer}</span>
          <span className="text-sm text-slate-400 font-medium">: End of Day Performance</span>
          <div className="text-xs text-slate-400 ml-auto">{rows.length} day{rows.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-green-900 text-white text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-semibold">Day</th>
                <th className="px-4 py-3 text-left font-semibold">Site</th>
                <th className="px-4 py-3 text-right font-semibold">Reg</th>
                <th className="px-4 py-3 text-right font-semibold">Ad Spend</th>
                <th className="px-4 py-3 text-right font-semibold">Total Deposit</th>
                <th className="px-4 py-3 text-right font-semibold">GGR</th>
                <th className="px-4 py-3 text-right font-semibold">Bonus</th>
                <th className="px-4 py-3 text-right font-semibold">NGR</th>
                <th className="px-4 py-3 text-right font-semibold">Efficacy %</th>
                <th className="px-4 py-3 text-center font-semibold w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-slate-400 text-sm">
                    No data for <strong>{selectedStreamer}</strong> in the selected date range.
                  </td>
                </tr>
              )}
              {rows.map((row, idx) => (
                <tr key={idx} className={`hover:bg-green-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                  <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{fmtDate(row.date)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${siteColors[row.siteName] || 'bg-gray-100 text-gray-600'}`}>{row.siteName}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{row.totalReg}</td>
                  <td className="px-4 py-3 text-right text-red-500 font-medium">{formatPHP(row.totalSpend)}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">{formatPHP(row.totalDep)}</td>
                  <td className={`px-4 py-3 text-right ${(row.ggr || 0) >= 0 ? 'text-slate-600' : 'text-red-500'}`}>{fmtVal(row.ggr)}</td>
                  <td className="px-4 py-3 text-right text-amber-600">{fmtVal(row.bonus)}</td>
                  <td className={`px-4 py-3 text-right ${(row.ngr || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtVal(row.ngr)}</td>
                  <td className={`px-4 py-3 text-right ${efficacyColor(row.efficacyRate)}`}>
                    {row.efficacyRate !== null ? `${row.efficacyRate.toFixed(2)}%` : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onEdit(row.date, selectedStreamer, row.siteName)}
                      className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit GGR / Bonus / NGR"
                    >
                      <Edit2 size={13}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="bg-green-900 text-white font-bold text-sm">
                  <td className="px-4 py-3 uppercase tracking-wider" colSpan={2}>{selectedStreamer} Total</td>
                  <td className="px-4 py-3 text-right">{totals.reg}</td>
                  <td className="px-4 py-3 text-right">{formatPHP(totals.spend)}</td>
                  <td className="px-4 py-3 text-right">{formatPHP(totals.dep)}</td>
                  <td className={`px-4 py-3 text-right ${totals.ggr >= 0 ? '' : 'text-red-300'}`}>{fmtVal(totals.ggr)}</td>
                  <td className="px-4 py-3 text-right opacity-80">{fmtVal(totals.bonus)}</td>
                  <td className={`px-4 py-3 text-right ${totals.ngr >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{fmtVal(totals.ngr)}</td>
                  <td className={`px-4 py-3 text-right ${totalEfficacy !== null && totalEfficacy >= 100 ? 'text-emerald-300' : totalEfficacy !== null ? 'text-amber-300' : ''}`}>
                    {totalEfficacy !== null ? `${totalEfficacy.toFixed(2)}%` : '—'}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {rows.length > 0 && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5">
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-indigo-600">Efficacy Rate</span> = NGR ÷ Ad Spend × 100 &nbsp;·&nbsp; Click the edit button per row to enter GGR, Bonus & NGR
            </p>
          </div>
        )}
      </div>
    </div>
  );
}