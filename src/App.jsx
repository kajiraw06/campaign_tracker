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

  // --- FEB 17 ---
  { date: '2026-02-17', site: 'WFL', streamer: 'GhostWrecker', spend: 2689.29, reg: 37, dep: 11210.00, type: 'Live', link: 'https://www.facebook.com/bosswrecker/videos/' },
  { date: '2026-02-17', site: 'WFL', streamer: 'Neggy', spend: 1911.41, reg: 64, dep: 6460.00, type: 'Live', link: 'https://www.facebook.com/NeggyTvOfficial/videos/' },
  { date: '2026-02-17', site: 'WFL', streamer: 'HolyFather', spend: 1033.64, reg: 15, dep: 3060.00, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-18', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 156, dep: 75979, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-19', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 128, dep: 103022, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-20', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 113, dep: 46856, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-21', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 63, dep: 59919, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-22', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 138, dep: 54208, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-23', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 68, dep: 84046, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-24', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 324, dep: 114190, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-25', site: 'WFL', streamer: 'HolyFather', spend: 0, reg: 101, dep: 26839, type: 'Live', link: 'https://www.facebook.com/100084497334397/videos/' },
  { date: '2026-02-17', site: 'WFL', streamer: 'Jason', spend: 286.09, reg: 0, dep: 1200.00, type: 'Reels', link: 'https://www.facebook.com/itsmeJ4soon/reels/' },
  { date: '2026-02-17', site: 'WFL', streamer: 'ATO', spend: 0, reg: 1, dep: 100.00, type: 'Live', link: 'https://www.facebook.com/AtoClassSWorldwide/videos/' },
  { date: '2026-02-17', site: 'RLM', streamer: 'AJ', spend: 1110.34, reg: 17, dep: 9120.00, type: 'Live', link: 'https://www.facebook.com/AprilJoyBarrueso/videos/' },
  { date: '2026-02-17', site: 'RLM', streamer: 'AJ', spend: 1166.56, reg: 0, dep: 0, type: 'Reels', link: 'https://www.facebook.com/AprilJoyBarrueso/reels/' },
  { date: '2026-02-17', site: 'RLM', streamer: 'Jape', spend: 830.70, reg: 4, dep: 13698.00, type: 'Reels', link: 'https://www.facebook.com/JapeAldeaOfficial/reels/' },
  { date: '2026-02-17', site: 'RLM', streamer: 'Sainty', spend: 0, reg: 1, dep: 4460.00, type: 'Live', link: 'https://www.facebook.com/videos/' },
  { date: '2026-02-17', site: 'RLM', streamer: 'Pepper', spend: 0, reg: 0, dep: 857.00, type: 'Reels', link: 'https://www.facebook.com/AkoSiPepVT/reels/' },
  { date: '2026-02-17', site: 'RLM', streamer: 'Yuji', spend: 0, reg: 0, dep: 150.00, type: 'Live', link: 'https://www.facebook.com/MageDadOfficial/videos/' },

  // --- CHAD ---
  { date: '2026-02-02', site: 'RLM', streamer: 'Chad', spend: 0, reg: 13, dep: 126660, type: 'Live', link: '' },
  { date: '2026-02-03', site: 'RLM', streamer: 'Chad', spend: 0, reg: 19, dep: 181457, type: 'Live', link: '' },
  { date: '2026-02-04', site: 'RLM', streamer: 'Chad', spend: 0, reg: 5, dep: 53930, type: 'Live', link: '' },
  { date: '2026-02-05', site: 'RLM', streamer: 'Chad', spend: 0, reg: 6, dep: 91641, type: 'Live', link: '' },
  { date: '2026-02-06', site: 'RLM', streamer: 'Chad', spend: 0, reg: 7, dep: 66680, type: 'Live', link: '' },
  { date: '2026-02-07', site: 'RLM', streamer: 'Chad', spend: 0, reg: 10, dep: 109046, type: 'Live', link: '' },
  { date: '2026-02-08', site: 'RLM', streamer: 'Chad', spend: 0, reg: 9, dep: 107703, type: 'Live', link: '' },
  { date: '2026-02-09', site: 'RLM', streamer: 'Chad', spend: 0, reg: 11, dep: 29629, type: 'Live', link: '' },
  { date: '2026-02-10', site: 'RLM', streamer: 'Chad', spend: 0, reg: 3, dep: 136931, type: 'Live', link: '' },
  { date: '2026-02-11', site: 'RLM', streamer: 'Chad', spend: 0, reg: 12, dep: 58650, type: 'Live', link: '' },
  { date: '2026-02-12', site: 'RLM', streamer: 'Chad', spend: 0, reg: 4, dep: 17983, type: 'Live', link: '' },
  { date: '2026-02-13', site: 'RLM', streamer: 'Chad', spend: 0, reg: 5, dep: 25003, type: 'Live', link: '' },
  { date: '2026-02-14', site: 'RLM', streamer: 'Chad', spend: 0, reg: 2, dep: 30801, type: 'Live', link: '' },
  { date: '2026-02-15', site: 'RLM', streamer: 'Chad', spend: 0, reg: 1, dep: 7582, type: 'Live', link: '' },
  { date: '2026-02-16', site: 'RLM', streamer: 'Chad', spend: 0, reg: 24, dep: 5282, type: 'Live', link: '' },
  { date: '2026-02-17', site: 'RLM', streamer: 'Chad', spend: 0, reg: 4, dep: 9250, type: 'Live', link: '' },
  { date: '2026-02-18', site: 'RLM', streamer: 'Chad', spend: 0, reg: 7, dep: 17335, type: 'Live', link: '' },
  { date: '2026-02-19', site: 'RLM', streamer: 'Chad', spend: 0, reg: 19, dep: 13922, type: 'Live', link: '' },
  { date: '2026-02-20', site: 'RLM', streamer: 'Chad', spend: 0, reg: 6, dep: 20543, type: 'Live', link: '' },
  { date: '2026-02-21', site: 'RLM', streamer: 'Chad', spend: 0, reg: 6, dep: 19671, type: 'Live', link: '' },
  { date: '2026-02-22', site: 'RLM', streamer: 'Chad', spend: 0, reg: 4, dep: 15811, type: 'Live', link: '' },
  { date: '2026-02-23', site: 'RLM', streamer: 'Chad', spend: 0, reg: 7, dep: 11575, type: 'Live', link: '' },
  { date: '2026-02-24', site: 'RLM', streamer: 'Chad', spend: 0, reg: 9, dep: 12946, type: 'Live', link: '' },

  // --- T2B STREAMERS ---
  // Dogie / T2B
  { date: '2026-02-02', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 1420, dep: 2109490, type: 'Live', link: '' },
  { date: '2026-02-03', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 2002, dep: 2413443, type: 'Live', link: '' },
  { date: '2026-02-04', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 2059, dep: 2553947, type: 'Live', link: '' },
  { date: '2026-02-05', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 1681, dep: 2029034, type: 'Live', link: '' },
  { date: '2026-02-06', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 1109, dep: 2200722, type: 'Live', link: '' },
  { date: '2026-02-07', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 916, dep: 2006314, type: 'Live', link: '' },
  { date: '2026-02-08', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 1837, dep: 1887784, type: 'Live', link: '' },
  { date: '2026-02-09', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 901, dep: 2276827, type: 'Live', link: '' },
  { date: '2026-02-10', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 656, dep: 1946819, type: 'Live', link: '' },
  { date: '2026-02-11', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 766, dep: 1819590, type: 'Live', link: '' },
  { date: '2026-02-12', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 729, dep: 1999877, type: 'Live', link: '' },
  { date: '2026-02-13', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 843, dep: 1963838, type: 'Live', link: '' },
  { date: '2026-02-14', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 738, dep: 1771982, type: 'Live', link: '' },
  { date: '2026-02-15', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 710, dep: 1980180, type: 'Live', link: '' },
  { date: '2026-02-16', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 508, dep: 1835063, type: 'Live', link: '' },
  { date: '2026-02-17', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 845, dep: 1532923, type: 'Live', link: '' },
  { date: '2026-02-18', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 823, dep: 1578565, type: 'Live', link: '' },
  { date: '2026-02-19', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 789, dep: 1830499, type: 'Live', link: '' },
  { date: '2026-02-20', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 1028, dep: 1825567, type: 'Live', link: '' },
  { date: '2026-02-21', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 715, dep: 1928158, type: 'Live', link: '' },
  { date: '2026-02-22', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 651, dep: 1673720, type: 'Live', link: '' },
  { date: '2026-02-23', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 622, dep: 1692087, type: 'Live', link: '' },
  { date: '2026-02-24', site: 'T2B', streamer: 'Dogie', spend: 0, reg: 553, dep: 1343763, type: 'Live', link: '' },
  // Renejay / T2B
  { date: '2026-02-02', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 4, dep: 84422, type: 'Live', link: '' },
  { date: '2026-02-03', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 3, dep: 45811, type: 'Live', link: '' },
  { date: '2026-02-04', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 9, dep: 41490, type: 'Live', link: '' },
  { date: '2026-02-05', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 0, dep: 49748, type: 'Live', link: '' },
  { date: '2026-02-06', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 439, dep: 64444, type: 'Live', link: '' },
  { date: '2026-02-07', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 569, dep: 121526, type: 'Live', link: '' },
  { date: '2026-02-08', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 284, dep: 85866, type: 'Live', link: '' },
  { date: '2026-02-09', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 228, dep: 65230, type: 'Live', link: '' },
  { date: '2026-02-10', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 1120, dep: 199758, type: 'Live', link: '' },
  { date: '2026-02-11', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 648, dep: 262715, type: 'Live', link: '' },
  { date: '2026-02-12', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 461, dep: 282354, type: 'Live', link: '' },
  { date: '2026-02-13', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 348, dep: 270160, type: 'Live', link: '' },
  { date: '2026-02-14', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 419, dep: 211797, type: 'Live', link: '' },
  { date: '2026-02-15', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 681, dep: 348136, type: 'Live', link: '' },
  { date: '2026-02-16', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 671, dep: 395735, type: 'Live', link: '' },
  { date: '2026-02-17', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 513, dep: 440188, type: 'Live', link: '' },
  { date: '2026-02-18', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 551, dep: 418698, type: 'Live', link: '' },
  { date: '2026-02-19', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 444, dep: 401624, type: 'Live', link: '' },
  { date: '2026-02-20', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 409, dep: 317220, type: 'Live', link: '' },
  { date: '2026-02-21', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 288, dep: 298831, type: 'Live', link: '' },
  { date: '2026-02-22', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 199, dep: 282997, type: 'Live', link: '' },
  { date: '2026-02-23', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 220, dep: 267400, type: 'Live', link: '' },
  { date: '2026-02-24', site: 'T2B', streamer: 'Renejay', spend: 0, reg: 211, dep: 298220, type: 'Live', link: '' },
  // H2wo / T2B
  { date: '2026-02-02', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 524, dep: 152339, type: 'Live', link: '' },
  { date: '2026-02-03', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 459, dep: 315916, type: 'Live', link: '' },
  { date: '2026-02-04', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 295, dep: 246274, type: 'Live', link: '' },
  { date: '2026-02-05', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 375, dep: 230540, type: 'Live', link: '' },
  { date: '2026-02-06', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 167, dep: 260601, type: 'Live', link: '' },
  { date: '2026-02-07', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 89, dep: 168016, type: 'Live', link: '' },
  { date: '2026-02-08', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 233, dep: 238278, type: 'Live', link: '' },
  { date: '2026-02-09', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 152, dep: 183873, type: 'Live', link: '' },
  { date: '2026-02-10', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 139, dep: 152746, type: 'Live', link: '' },
  { date: '2026-02-11', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 100, dep: 133605, type: 'Live', link: '' },
  { date: '2026-02-12', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 339, dep: 195826, type: 'Live', link: '' },
  { date: '2026-02-13', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 187, dep: 205681, type: 'Live', link: '' },
  { date: '2026-02-14', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 119, dep: 183822, type: 'Live', link: '' },
  { date: '2026-02-15', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 237, dep: 232444, type: 'Live', link: '' },
  { date: '2026-02-16', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 294, dep: 240216, type: 'Live', link: '' },
  { date: '2026-02-17', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 496, dep: 208424, type: 'Live', link: '' },
  { date: '2026-02-18', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 257, dep: 203028, type: 'Live', link: '' },
  { date: '2026-02-19', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 200, dep: 180591, type: 'Live', link: '' },
  { date: '2026-02-20', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 210, dep: 241459, type: 'Live', link: '' },
  { date: '2026-02-21', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 639, dep: 247740, type: 'Live', link: '' },
  { date: '2026-02-22', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 319, dep: 196667, type: 'Live', link: '' },
  { date: '2026-02-23', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 458, dep: 273695, type: 'Live', link: '' },
  { date: '2026-02-24', site: 'T2B', streamer: 'H2wo', spend: 0, reg: 477, dep: 212019, type: 'Live', link: '' },
  // Yawi / T2B
  { date: '2026-02-02', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 208, dep: 110523, type: 'Live', link: '' },
  { date: '2026-02-03', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 109, dep: 110444, type: 'Live', link: '' },
  { date: '2026-02-04', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 111, dep: 98599, type: 'Live', link: '' },
  { date: '2026-02-05', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 200, dep: 125840, type: 'Live', link: '' },
  { date: '2026-02-06', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 214, dep: 182908, type: 'Live', link: '' },
  { date: '2026-02-07', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 256, dep: 171529, type: 'Live', link: '' },
  { date: '2026-02-08', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 173, dep: 209711, type: 'Live', link: '' },
  { date: '2026-02-09', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 74, dep: 139874, type: 'Live', link: '' },
  { date: '2026-02-10', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 100, dep: 116358, type: 'Live', link: '' },
  { date: '2026-02-11', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 88, dep: 90968, type: 'Live', link: '' },
  { date: '2026-02-12', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 277, dep: 106435, type: 'Live', link: '' },
  { date: '2026-02-13', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 88, dep: 126199, type: 'Live', link: '' },
  { date: '2026-02-14', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 145, dep: 167128, type: 'Live', link: '' },
  { date: '2026-02-15', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 260, dep: 199787, type: 'Live', link: '' },
  { date: '2026-02-16', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 124, dep: 153362, type: 'Live', link: '' },
  { date: '2026-02-17', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 103, dep: 94884, type: 'Live', link: '' },
  { date: '2026-02-18', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 267, dep: 120259, type: 'Live', link: '' },
  { date: '2026-02-19', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 108, dep: 147034, type: 'Live', link: '' },
  { date: '2026-02-20', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 355, dep: 172421, type: 'Live', link: '' },
  { date: '2026-02-21', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 252, dep: 156323, type: 'Live', link: '' },
  { date: '2026-02-22', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 96, dep: 307467, type: 'Live', link: '' },
  { date: '2026-02-23', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 259, dep: 151913, type: 'Live', link: '' },
  { date: '2026-02-24', site: 'T2B', streamer: 'Yawi', spend: 0, reg: 143, dep: 153270, type: 'Live', link: '' },
  // Zico / T2B
  { date: '2026-02-02', site: 'T2B', streamer: 'Zico', spend: 0, reg: 44, dep: 3915, type: 'Live', link: '' },
  { date: '2026-02-03', site: 'T2B', streamer: 'Zico', spend: 0, reg: 141, dep: 5583, type: 'Live', link: '' },
  { date: '2026-02-04', site: 'T2B', streamer: 'Zico', spend: 0, reg: 99, dep: 5808, type: 'Live', link: '' },
  { date: '2026-02-05', site: 'T2B', streamer: 'Zico', spend: 0, reg: 51, dep: 26755, type: 'Live', link: '' },
  { date: '2026-02-06', site: 'T2B', streamer: 'Zico', spend: 0, reg: 42, dep: 6065, type: 'Live', link: '' },
  { date: '2026-02-07', site: 'T2B', streamer: 'Zico', spend: 0, reg: 4, dep: 2470, type: 'Live', link: '' },
  { date: '2026-02-08', site: 'T2B', streamer: 'Zico', spend: 0, reg: 4, dep: 3761, type: 'Live', link: '' },
  { date: '2026-02-09', site: 'T2B', streamer: 'Zico', spend: 0, reg: 0, dep: 9335, type: 'Live', link: '' },
  { date: '2026-02-10', site: 'T2B', streamer: 'Zico', spend: 0, reg: 7, dep: 2341, type: 'Live', link: '' },
  { date: '2026-02-11', site: 'T2B', streamer: 'Zico', spend: 0, reg: 8, dep: 1649, type: 'Live', link: '' },
  { date: '2026-02-12', site: 'T2B', streamer: 'Zico', spend: 0, reg: 2, dep: 3680, type: 'Live', link: '' },
  { date: '2026-02-13', site: 'T2B', streamer: 'Zico', spend: 0, reg: 43, dep: 2490, type: 'Live', link: '' },
  { date: '2026-02-14', site: 'T2B', streamer: 'Zico', spend: 0, reg: 4, dep: 5229, type: 'Live', link: '' },
  { date: '2026-02-15', site: 'T2B', streamer: 'Zico', spend: 0, reg: 6, dep: 8205, type: 'Live', link: '' },
  { date: '2026-02-16', site: 'T2B', streamer: 'Zico', spend: 0, reg: 25, dep: 56034, type: 'Live', link: '' },
  { date: '2026-02-17', site: 'T2B', streamer: 'Zico', spend: 0, reg: 4, dep: 20403, type: 'Live', link: '' },
  { date: '2026-02-18', site: 'T2B', streamer: 'Zico', spend: 0, reg: 6, dep: 3790, type: 'Live', link: '' },
  { date: '2026-02-19', site: 'T2B', streamer: 'Zico', spend: 0, reg: 8, dep: 2520, type: 'Live', link: '' },
  { date: '2026-02-20', site: 'T2B', streamer: 'Zico', spend: 0, reg: 8, dep: 2292, type: 'Live', link: '' },
  { date: '2026-02-21', site: 'T2B', streamer: 'Zico', spend: 0, reg: 3, dep: 4040, type: 'Live', link: '' },
  { date: '2026-02-22', site: 'T2B', streamer: 'Zico', spend: 0, reg: 0, dep: 2500, type: 'Live', link: '' },
  { date: '2026-02-23', site: 'T2B', streamer: 'Zico', spend: 0, reg: 19, dep: 10675, type: 'Live', link: '' },
  { date: '2026-02-24', site: 'T2B', streamer: 'Zico', spend: 0, reg: 3, dep: 10820, type: 'Live', link: '' },
  // Jape / T2B
  { date: '2026-02-02', site: 'T2B', streamer: 'Jape', spend: 0, reg: 122, dep: 32430, type: 'Live', link: '' },
  { date: '2026-02-03', site: 'T2B', streamer: 'Jape', spend: 0, reg: 116, dep: 22407, type: 'Live', link: '' },
  { date: '2026-02-04', site: 'T2B', streamer: 'Jape', spend: 0, reg: 27, dep: 27883, type: 'Live', link: '' },
  { date: '2026-02-05', site: 'T2B', streamer: 'Jape', spend: 0, reg: 26, dep: 29748, type: 'Live', link: '' },
  { date: '2026-02-06', site: 'T2B', streamer: 'Jape', spend: 0, reg: 19, dep: 35977, type: 'Live', link: '' },
  { date: '2026-02-07', site: 'T2B', streamer: 'Jape', spend: 0, reg: 19, dep: 42789, type: 'Live', link: '' },
  { date: '2026-02-08', site: 'T2B', streamer: 'Jape', spend: 0, reg: 7, dep: 20756, type: 'Live', link: '' },
  { date: '2026-02-09', site: 'T2B', streamer: 'Jape', spend: 0, reg: 8, dep: 13015, type: 'Live', link: '' },
  { date: '2026-02-10', site: 'T2B', streamer: 'Jape', spend: 0, reg: 28, dep: 20660, type: 'Live', link: '' },
  { date: '2026-02-11', site: 'T2B', streamer: 'Jape', spend: 0, reg: 24, dep: 44349, type: 'Live', link: '' },
  { date: '2026-02-12', site: 'T2B', streamer: 'Jape', spend: 0, reg: 16, dep: 12876, type: 'Live', link: '' },
  { date: '2026-02-13', site: 'T2B', streamer: 'Jape', spend: 0, reg: 31, dep: 34433, type: 'Live', link: '' },
  { date: '2026-02-14', site: 'T2B', streamer: 'Jape', spend: 0, reg: 24, dep: 32210, type: 'Live', link: '' },
  { date: '2026-02-15', site: 'T2B', streamer: 'Jape', spend: 0, reg: 23, dep: 32530, type: 'Live', link: '' },
  { date: '2026-02-16', site: 'T2B', streamer: 'Jape', spend: 0, reg: 12, dep: 39040, type: 'Live', link: '' },
  { date: '2026-02-17', site: 'T2B', streamer: 'Jape', spend: 0, reg: 20, dep: 31205, type: 'Live', link: '' },
  { date: '2026-02-18', site: 'T2B', streamer: 'Jape', spend: 0, reg: 19, dep: 25831, type: 'Live', link: '' },
  { date: '2026-02-19', site: 'T2B', streamer: 'Jape', spend: 0, reg: 16, dep: 100214, type: 'Live', link: '' },
  { date: '2026-02-20', site: 'T2B', streamer: 'Jape', spend: 0, reg: 46, dep: 121665, type: 'Live', link: '' },
  { date: '2026-02-21', site: 'T2B', streamer: 'Jape', spend: 0, reg: 108, dep: 59384, type: 'Live', link: '' },
  { date: '2026-02-22', site: 'T2B', streamer: 'Jape', spend: 0, reg: 36, dep: 18191, type: 'Live', link: '' },
  { date: '2026-02-23', site: 'T2B', streamer: 'Jape', spend: 0, reg: 25, dep: 16451, type: 'Live', link: '' },
  { date: '2026-02-24', site: 'T2B', streamer: 'Jape', spend: 0, reg: 18, dep: 33692, type: 'Live', link: '' },
  // Ribo / T2B
  { date: '2026-02-03', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 5, dep: 245, type: 'Live', link: '' },
  { date: '2026-02-04', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 30, dep: 4660, type: 'Live', link: '' },
  { date: '2026-02-05', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 11, dep: 1000, type: 'Live', link: '' },
  { date: '2026-02-06', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 79, dep: 7478, type: 'Live', link: '' },
  { date: '2026-02-07', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 47, dep: 4850, type: 'Live', link: '' },
  { date: '2026-02-08', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 23, dep: 5444, type: 'Live', link: '' },
  { date: '2026-02-09', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 44, dep: 7639, type: 'Live', link: '' },
  { date: '2026-02-10', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 43, dep: 26680, type: 'Live', link: '' },
  { date: '2026-02-11', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 31, dep: 8373, type: 'Live', link: '' },
  { date: '2026-02-12', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 19, dep: 11204, type: 'Live', link: '' },
  { date: '2026-02-13', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 19, dep: 7850, type: 'Live', link: '' },
  { date: '2026-02-14', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 21, dep: 7201, type: 'Live', link: '' },
  { date: '2026-02-15', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 21, dep: 4696, type: 'Live', link: '' },
  { date: '2026-02-16', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 19, dep: 5085, type: 'Live', link: '' },
  { date: '2026-02-17', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 34, dep: 7450, type: 'Live', link: '' },
  { date: '2026-02-18', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 19, dep: 5100, type: 'Live', link: '' },
  { date: '2026-02-19', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 16, dep: 4068, type: 'Live', link: '' },
  { date: '2026-02-20', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 8, dep: 3500, type: 'Live', link: '' },
  { date: '2026-02-21', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 20, dep: 6039, type: 'Live', link: '' },
  { date: '2026-02-22', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 17, dep: 3218, type: 'Live', link: '' },
  { date: '2026-02-23', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 48, dep: 5285, type: 'Live', link: '' },
  { date: '2026-02-24', site: 'T2B', streamer: 'Ribo', spend: 0, reg: 22, dep: 3441, type: 'Live', link: '' },
  // Krilla / T2B
  { date: '2026-02-23', site: 'T2B', streamer: 'Krilla', spend: 0, reg: 2, dep: 500, type: 'Live', link: '' },
  { date: '2026-02-24', site: 'T2B', streamer: 'Krilla', spend: 0, reg: 3, dep: 600, type: 'Live', link: '' },
  // Yuji / T2B
  { date: '2026-02-02', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 3, dep: 0, type: 'Live', link: '' },
  { date: '2026-02-03', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 7, dep: 0, type: 'Live', link: '' },
  { date: '2026-02-04', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 23, dep: 0, type: 'Live', link: '' },
  { date: '2026-02-05', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 2, dep: 0, type: 'Live', link: '' },
  { date: '2026-02-06', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 38, dep: 0, type: 'Live', link: '' },
  { date: '2026-02-07', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 24, dep: 9050, type: 'Live', link: '' },
  { date: '2026-02-08', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 9, dep: 11000, type: 'Live', link: '' },
  { date: '2026-02-09', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 6, dep: 2680, type: 'Live', link: '' },
  { date: '2026-02-10', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 6, dep: 700, type: 'Live', link: '' },
  { date: '2026-02-11', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 19, dep: 1450, type: 'Live', link: '' },
  { date: '2026-02-12', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 17, dep: 7643, type: 'Live', link: '' },
  { date: '2026-02-13', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 7, dep: 9855, type: 'Live', link: '' },
  { date: '2026-02-14', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 18, dep: 7950, type: 'Live', link: '' },
  { date: '2026-02-15', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 9, dep: 1901, type: 'Live', link: '' },
  { date: '2026-02-16', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 32, dep: 1790, type: 'Live', link: '' },
  { date: '2026-02-17', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 27, dep: 4950, type: 'Live', link: '' },
  { date: '2026-02-18', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 36, dep: 8986, type: 'Live', link: '' },
  { date: '2026-02-19', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 8, dep: 7950, type: 'Live', link: '' },
  { date: '2026-02-20', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 16, dep: 4759, type: 'Live', link: '' },
  { date: '2026-02-21', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 13, dep: 2530, type: 'Live', link: '' },
  { date: '2026-02-22', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 10, dep: 2648, type: 'Live', link: '' },
  { date: '2026-02-23', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 6, dep: 3204, type: 'Live', link: '' },
  { date: '2026-02-24', site: 'T2B', streamer: 'Yuji', spend: 0, reg: 3, dep: 600, type: 'Live', link: '' },
  // Wrecker / T2B
  { date: '2026-02-09', site: 'T2B', streamer: 'Wrecker', spend: 0, reg: 40, dep: 4195, type: 'Live', link: '' },
  { date: '2026-02-10', site: 'T2B', streamer: 'Wrecker', spend: 0, reg: 51, dep: 16004, type: 'Live', link: '' },
  { date: '2026-02-11', site: 'T2B', streamer: 'Wrecker', spend: 0, reg: 29, dep: 15303, type: 'Live', link: '' },
  { date: '2026-02-12', site: 'T2B', streamer: 'Wrecker', spend: 0, reg: 18, dep: 39952, type: 'Live', link: '' },
  { date: '2026-02-13', site: 'T2B', streamer: 'Wrecker', spend: 0, reg: 16, dep: 10267, type: 'Live', link: '' },
  { date: '2026-02-14', site: 'T2B', streamer: 'Wrecker', spend: 0, reg: 4, dep: 6199, type: 'Live', link: '' },
  { date: '2026-02-15', site: 'T2B', streamer: 'Wrecker', spend: 0, reg: 2, dep: 5820, type: 'Live', link: '' },
  { date: '2026-02-16', site: 'T2B', streamer: 'Wrecker', spend: 0, reg: 0, dep: 1300, type: 'Live', link: '' },
  { date: '2026-02-17', site: 'T2B', streamer: 'Wrecker', spend: 0, reg: 1, dep: 1600, type: 'Live', link: '' },
  { date: '2026-02-18', site: 'T2B', streamer: 'Wrecker', spend: 0, reg: 51, dep: 5790, type: 'Live', link: '' },
  { date: '2026-02-19', site: 'T2B', streamer: 'Wrecker', spend: 0, reg: 31, dep: 7911, type: 'Live', link: '' },
  { date: '2026-02-20', site: 'T2B', streamer: 'Wrecker', spend: 0, reg: 7, dep: 6550, type: 'Live', link: '' },
  { date: '2026-02-21', site: 'T2B', streamer: 'Wrecker', spend: 0, reg: 230, dep: 5827, type: 'Live', link: '' },
  { date: '2026-02-22', site: 'T2B', streamer: 'Wrecker', spend: 0, reg: 19, dep: 7278, type: 'Live', link: '' },
  { date: '2026-02-23', site: 'T2B', streamer: 'Wrecker', spend: 0, reg: 145, dep: 10654, type: 'Live', link: '' },
  { date: '2026-02-24', site: 'T2B', streamer: 'Wrecker', spend: 0, reg: 15, dep: 7518, type: 'Live', link: '' },
  // Trixie / T2B
  { date: '2026-02-21', site: 'T2B', streamer: 'Trixie', spend: 0, reg: 9, dep: 700, type: 'Live', link: '' },
  { date: '2026-02-22', site: 'T2B', streamer: 'Trixie', spend: 0, reg: 54, dep: 7747, type: 'Live', link: '' },
  { date: '2026-02-23', site: 'T2B', streamer: 'Trixie', spend: 0, reg: 55, dep: 5203, type: 'Live', link: '' },
  { date: '2026-02-24', site: 'T2B', streamer: 'Trixie', spend: 0, reg: 15, dep: 7518, type: 'Live', link: '' },

  // ChadKinis / RLM
  { date: '2026-02-02', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 376, dep: 418449, type: 'Live', link: '' },
  { date: '2026-02-03', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 408, dep: 500215, type: 'Live', link: '' },
  { date: '2026-02-04', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 277, dep: 436670, type: 'Live', link: '' },
  { date: '2026-02-05', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 105, dep: 393655, type: 'Live', link: '' },
  { date: '2026-02-06', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 222, dep: 310893, type: 'Live', link: '' },
  { date: '2026-02-07', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 210, dep: 345418, type: 'Live', link: '' },
  { date: '2026-02-08', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 108, dep: 296569, type: 'Live', link: '' },
  { date: '2026-02-09', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 266, dep: 257787, type: 'Live', link: '' },
  { date: '2026-02-10', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 46, dep: 380984, type: 'Live', link: '' },
  { date: '2026-02-11', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 1351, dep: 221121, type: 'Live', link: '' },
  { date: '2026-02-12', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 199, dep: 252491, type: 'Live', link: '' },
  { date: '2026-02-13', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 266, dep: 194787, type: 'Live', link: '' },
  { date: '2026-02-14', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 30, dep: 301675, type: 'Live', link: '' },
  { date: '2026-02-15', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 23, dep: 292559, type: 'Live', link: '' },
  { date: '2026-02-16', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 544, dep: 243357, type: 'Live', link: '' },
  { date: '2026-02-17', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 222, dep: 237821, type: 'Live', link: '' },
  { date: '2026-02-18', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 319, dep: 199465, type: 'Live', link: '' },
  { date: '2026-02-19', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 206, dep: 279008, type: 'Live', link: '' },
  { date: '2026-02-20', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 110, dep: 233861, type: 'Live', link: '' },
  { date: '2026-02-21', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 40, dep: 271606, type: 'Live', link: '' },
  { date: '2026-02-22', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 285, dep: 145278, type: 'Live', link: '' },
  { date: '2026-02-23', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 228, dep: 257691, type: 'Live', link: '' },
  { date: '2026-02-24', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 304, dep: 221576, type: 'Live', link: '' },
  { date: '2026-02-25', site: 'RLM', streamer: 'ChadKinis', spend: 0, reg: 167, dep: 175338, type: 'Live', link: '' },
  // Affiliate / RLM
  { date: '2026-02-02', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 1, dep: 3280, type: 'Live', link: '' },
  { date: '2026-02-03', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 5, dep: 3299, type: 'Live', link: '' },
  { date: '2026-02-04', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 1, dep: 2645, type: 'Live', link: '' },
  { date: '2026-02-05', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 1, dep: 570, type: 'Live', link: '' },
  { date: '2026-02-06', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 2, dep: 2487, type: 'Live', link: '' },
  { date: '2026-02-07', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 4, dep: 71400, type: 'Live', link: '' },
  { date: '2026-02-08', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 4, dep: 3350, type: 'Live', link: '' },
  { date: '2026-02-09', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 1, dep: 1954, type: 'Live', link: '' },
  { date: '2026-02-10', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 5, dep: 1391, type: 'Live', link: '' },
  { date: '2026-02-11', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 3, dep: 5250, type: 'Live', link: '' },
  { date: '2026-02-12', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 1, dep: 4000, type: 'Live', link: '' },
  { date: '2026-02-13', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 1, dep: 1800, type: 'Live', link: '' },
  { date: '2026-02-14', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 5, dep: 1263, type: 'Live', link: '' },
  { date: '2026-02-15', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 0, dep: 3080, type: 'Live', link: '' },
  { date: '2026-02-16', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 2, dep: 1400, type: 'Live', link: '' },
  { date: '2026-02-17', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 3, dep: 1100, type: 'Live', link: '' },
  { date: '2026-02-18', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 2, dep: 3600, type: 'Live', link: '' },
  { date: '2026-02-19', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 2, dep: 103900, type: 'Live', link: '' },
  { date: '2026-02-20', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 1, dep: 3149, type: 'Live', link: '' },
  { date: '2026-02-21', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 3, dep: 5001, type: 'Live', link: '' },
  { date: '2026-02-22', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 1, dep: 2550, type: 'Live', link: '' },
  { date: '2026-02-23', site: 'RLM', streamer: 'Affiliate', spend: 0, reg: 3, dep: 103300, type: 'Live', link: '' },

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

// --- DEFAULT CREATOR PERF DATA (from Google Sheets) ---
// Keys: "YYYY-MM-DD|streamer|site"  Values: { ggr, bonus, ngr }
const defaultCreatorPerfData = {
  // HolyFather / WFL
  '2026-02-02|HolyFather|WFL': { ggr: 5115, bonus: 7303, ngr: 12418 },
  '2026-02-03|HolyFather|WFL': { ggr: -92914, bonus: 6322, ngr: -86592 },
  '2026-02-04|HolyFather|WFL': { ggr: -13471, bonus: 3629, ngr: -9843 },
  '2026-02-05|HolyFather|WFL': { ggr: -49516, bonus: 3894, ngr: -45622 },
  '2026-02-06|HolyFather|WFL': { ggr: 28773, bonus: 1171, ngr: 29944 },
  '2026-02-07|HolyFather|WFL': { ggr: -62831, bonus: 835, ngr: -61996 },
  '2026-02-08|HolyFather|WFL': { ggr: 72038, bonus: 745, ngr: 72783 },
  '2026-02-09|HolyFather|WFL': { ggr: -335363, bonus: 295, ngr: -335068 },
  '2026-02-10|HolyFather|WFL': { ggr: -119742, bonus: 290, ngr: -119452 },
  '2026-02-11|HolyFather|WFL': { ggr: -61818, bonus: 411, ngr: -61407 },
  '2026-02-12|HolyFather|WFL': { ggr: -25233, bonus: 200, ngr: -25033 },
  '2026-02-13|HolyFather|WFL': { ggr: 141598, bonus: 435, ngr: 142033 },
  '2026-02-14|HolyFather|WFL': { ggr: -23317, bonus: 254, ngr: -23063 },
  '2026-02-15|HolyFather|WFL': { ggr: -19952, bonus: 455, ngr: -19497 },
  '2026-02-16|HolyFather|WFL': { ggr: -48179, bonus: 80, ngr: -48099 },
  '2026-02-17|HolyFather|WFL': { ggr: -11299, bonus: 8342, ngr: -2957 },
  '2026-02-18|HolyFather|WFL': { ggr: -64833, bonus: 882, ngr: -63950 },
  '2026-02-19|HolyFather|WFL': { ggr: -78738, bonus: 745, ngr: -77993 },
  '2026-02-20|HolyFather|WFL': { ggr: 31539, bonus: 440, ngr: 31979 },
  '2026-02-21|HolyFather|WFL': { ggr: -5494, bonus: 431, ngr: -5063 },
  '2026-02-22|HolyFather|WFL': { ggr: -24460, bonus: 5532, ngr: -18928 },
  '2026-02-23|HolyFather|WFL': { ggr: -61164, bonus: 282, ngr: -60882 },
  '2026-02-24|HolyFather|WFL': { ggr: -88487, bonus: 8364, ngr: -80123 },
  '2026-02-25|HolyFather|WFL': { ggr: -2470, bonus: 284, ngr: -2186 },
  // ATO (CLASSS) / WFL
  '2026-02-02|ATO|WFL': { ggr: -44071, bonus: 1997, ngr: -42074 },
  '2026-02-03|ATO|WFL': { ggr: -10366, bonus: 929, ngr: -9438 },
  '2026-02-04|ATO|WFL': { ggr: -7912, bonus: 1339, ngr: -6573 },
  '2026-02-05|ATO|WFL': { ggr: -23319, bonus: 1532, ngr: -21787 },
  '2026-02-06|ATO|WFL': { ggr: -53890, bonus: 590, ngr: -53300 },
  '2026-02-07|ATO|WFL': { ggr: -40141, bonus: 691, ngr: -39450 },
  '2026-02-08|ATO|WFL': { ggr: -7784, bonus: 615, ngr: -7169 },
  '2026-02-09|ATO|WFL': { ggr: 1894, bonus: 135, ngr: 2029 },
  '2026-02-10|ATO|WFL': { ggr: 2224, bonus: 40, ngr: 2264 },
  '2026-02-11|ATO|WFL': { ggr: -11558, bonus: 237, ngr: -11321 },
  '2026-02-12|ATO|WFL': { ggr: 505, bonus: 155, ngr: 659 },
  '2026-02-13|ATO|WFL': { ggr: -3368, bonus: 60, ngr: -3308 },
  '2026-02-14|ATO|WFL': { ggr: -9809, bonus: 47, ngr: -9762 },
  '2026-02-15|ATO|WFL': { ggr: -56549, bonus: 925, ngr: -55624 },
  '2026-02-16|ATO|WFL': { ggr: -10995, bonus: 460, ngr: -10535 },
  '2026-02-17|ATO|WFL': { ggr: -14491, bonus: 997, ngr: -13494 },
  '2026-02-18|ATO|WFL': { ggr: -10660, bonus: 649, ngr: -10011 },
  '2026-02-19|ATO|WFL': { ggr: -4355, bonus: 30, ngr: -4325 },
  '2026-02-20|ATO|WFL': { ggr: -66615, bonus: 410, ngr: -66205 },
  '2026-02-21|ATO|WFL': { ggr: -2567, bonus: 60, ngr: -2507 },
  '2026-02-22|ATO|WFL': { ggr: -7806, bonus: 30, ngr: -7776 },
  '2026-02-23|ATO|WFL': { ggr: -10122, bonus: 0, ngr: -10122 },
  '2026-02-24|ATO|WFL': { ggr: 6733, bonus: 180, ngr: 6913 },
  // Sainty / RLM
  '2026-02-02|Sainty|RLM': { ggr: -28426, bonus: 15946, ngr: -12480 },
  '2026-02-03|Sainty|RLM': { ggr: 27353, bonus: 10698, ngr: 38051 },
  '2026-02-04|Sainty|RLM': { ggr: -41696, bonus: 8543, ngr: -33153 },
  '2026-02-05|Sainty|RLM': { ggr: -48734, bonus: 5531, ngr: -43203 },
  '2026-02-06|Sainty|RLM': { ggr: -97207, bonus: 1509, ngr: -95699 },
  '2026-02-07|Sainty|RLM': { ggr: -23565, bonus: 791, ngr: -22774 },
  '2026-02-08|Sainty|RLM': { ggr: -113788, bonus: 744, ngr: -113044 },
  '2026-02-09|Sainty|RLM': { ggr: -59118, bonus: 3512, ngr: -55605 },
  '2026-02-10|Sainty|RLM': { ggr: 19505, bonus: 8196, ngr: 27701 },
  '2026-02-11|Sainty|RLM': { ggr: -31155, bonus: 1211, ngr: -29944 },
  '2026-02-12|Sainty|RLM': { ggr: -13359, bonus: 4660, ngr: -8699 },
  '2026-02-13|Sainty|RLM': { ggr: -34728, bonus: 1332, ngr: -33396 },
  '2026-02-14|Sainty|RLM': { ggr: -29052, bonus: 1901, ngr: -27151 },
  '2026-02-15|Sainty|RLM': { ggr: -9384, bonus: 5369, ngr: -4015 },
  '2026-02-16|Sainty|RLM': { ggr: -23571, bonus: 3031, ngr: -20540 },
  '2026-02-17|Sainty|RLM': { ggr: 49317, bonus: 4836, ngr: 54153 },
  '2026-02-18|Sainty|RLM': { ggr: -57391, bonus: 378, ngr: -57013 },
  '2026-02-19|Sainty|RLM': { ggr: -49610, bonus: 867, ngr: -48744 },
  '2026-02-20|Sainty|RLM': { ggr: 42494, bonus: 4458, ngr: 46952 },
  '2026-02-21|Sainty|RLM': { ggr: -30632, bonus: 2424, ngr: -28208 },
  '2026-02-22|Sainty|RLM': { ggr: -43124, bonus: 476, ngr: -42647 },
  '2026-02-23|Sainty|RLM': { ggr: 13123, bonus: 1559, ngr: 14682 },
  '2026-02-24|Sainty|RLM': { ggr: -109637, bonus: 1405, ngr: -108233 },
  // Yuji / RLM
  '2026-02-02|Yuji|RLM': { ggr: -30600, bonus: 9997, ngr: -20603 },
  '2026-02-03|Yuji|RLM': { ggr: -29808, bonus: 6357, ngr: -23450 },
  '2026-02-04|Yuji|RLM': { ggr: -24242, bonus: 2487, ngr: -21755 },
  '2026-02-05|Yuji|RLM': { ggr: 23460, bonus: 3364, ngr: 26824 },
  '2026-02-06|Yuji|RLM': { ggr: -48380, bonus: 396, ngr: -47984 },
  '2026-02-07|Yuji|RLM': { ggr: -13187, bonus: 478, ngr: -12709 },
  '2026-02-08|Yuji|RLM': { ggr: 15262, bonus: 223, ngr: 15485 },
  '2026-02-09|Yuji|RLM': { ggr: -8915, bonus: 715, ngr: -8201 },
  '2026-02-10|Yuji|RLM': { ggr: -5580, bonus: 888, ngr: -4692 },
  '2026-02-11|Yuji|RLM': { ggr: -80179, bonus: 4911, ngr: -75268 },
  '2026-02-12|Yuji|RLM': { ggr: -6477, bonus: 240, ngr: -6238 },
  '2026-02-13|Yuji|RLM': { ggr: -27953, bonus: 415, ngr: -27538 },
  '2026-02-14|Yuji|RLM': { ggr: -38209, bonus: 351, ngr: -37858 },
  '2026-02-15|Yuji|RLM': { ggr: 44143, bonus: 3010, ngr: 47153 },
  '2026-02-16|Yuji|RLM': { ggr: -83800, bonus: 5952, ngr: -77847 },
  '2026-02-17|Yuji|RLM': { ggr: -18650, bonus: 761, ngr: -17890 },
  '2026-02-18|Yuji|RLM': { ggr: 3348, bonus: 186, ngr: 3534 },
  '2026-02-19|Yuji|RLM': { ggr: -56875, bonus: 232, ngr: -56643 },
  '2026-02-20|Yuji|RLM': { ggr: -12681, bonus: 200, ngr: -12480 },
  '2026-02-21|Yuji|RLM': { ggr: -8840, bonus: 172, ngr: -8668 },
  '2026-02-22|Yuji|RLM': { ggr: -2885, bonus: 183, ngr: -2701 },
  '2026-02-23|Yuji|RLM': { ggr: 8817, bonus: 1316, ngr: 10133 },
  '2026-02-24|Yuji|RLM': { ggr: 14564, bonus: 14564, ngr: 29128 },
  // Kim / RLM
  '2026-02-02|Kim|RLM': { ggr: -11042, bonus: 2341, ngr: -8701 },
  '2026-02-03|Kim|RLM': { ggr: -10409, bonus: 3243, ngr: -7166 },
  '2026-02-04|Kim|RLM': { ggr: -40473, bonus: 2127, ngr: -38345 },
  '2026-02-05|Kim|RLM': { ggr: 468, bonus: 1236, ngr: 1704 },
  '2026-02-06|Kim|RLM': { ggr: -19338, bonus: 708, ngr: -18630 },
  '2026-02-07|Kim|RLM': { ggr: -2701, bonus: 1106, ngr: -1595 },
  '2026-02-08|Kim|RLM': { ggr: -9139, bonus: 664, ngr: -8475 },
  '2026-02-09|Kim|RLM': { ggr: -16131, bonus: 1012, ngr: -15119 },
  '2026-02-10|Kim|RLM': { ggr: -10988, bonus: 161, ngr: -10827 },
  '2026-02-11|Kim|RLM': { ggr: -14709, bonus: 140, ngr: -14569 },
  '2026-02-12|Kim|RLM': { ggr: -3902, bonus: 70, ngr: -3832 },
  '2026-02-13|Kim|RLM': { ggr: 256, bonus: 0, ngr: 256 },
  '2026-02-14|Kim|RLM': { ggr: -11454, bonus: 210, ngr: -11244 },
  '2026-02-15|Kim|RLM': { ggr: -241, bonus: 20, ngr: -221 },
  '2026-02-16|Kim|RLM': { ggr: -6110, bonus: 447, ngr: -5663 },
  '2026-02-17|Kim|RLM': { ggr: -8584, bonus: 70, ngr: -8514 },
  '2026-02-18|Kim|RLM': { ggr: -1842, bonus: 164, ngr: -1678 },
  '2026-02-19|Kim|RLM': { ggr: -3958, bonus: 80, ngr: -3878 },
  '2026-02-20|Kim|RLM': { ggr: -99, bonus: 592, ngr: 493 },
  '2026-02-21|Kim|RLM': { ggr: 20879, bonus: 666, ngr: 21545 },
  '2026-02-22|Kim|RLM': { ggr: 6219, bonus: 195, ngr: 6414 },
  '2026-02-23|Kim|RLM': { ggr: -13776, bonus: 963, ngr: -12812 },
  '2026-02-24|Kim|RLM': { ggr: -14347, bonus: 60, ngr: -14287 },
  // AJ / RLM
  '2026-02-02|AJ|RLM': { ggr: -56550, bonus: 50784, ngr: -5766 },
  '2026-02-03|AJ|RLM': { ggr: -88574, bonus: 18090, ngr: -70484 },
  '2026-02-04|AJ|RLM': { ggr: -106473, bonus: 12547, ngr: -93926 },
  '2026-02-05|AJ|RLM': { ggr: 16071, bonus: 22119, ngr: 38190 },
  '2026-02-06|AJ|RLM': { ggr: -57240, bonus: 2657, ngr: -54583 },
  '2026-02-07|AJ|RLM': { ggr: -16504, bonus: 3361, ngr: -13143 },
  '2026-02-08|AJ|RLM': { ggr: -151751, bonus: 1819, ngr: -149932 },
  '2026-02-09|AJ|RLM': { ggr: -61240, bonus: 6954, ngr: -54286 },
  '2026-02-10|AJ|RLM': { ggr: -29904, bonus: 7302, ngr: -22601 },
  '2026-02-11|AJ|RLM': { ggr: -48841, bonus: 1628, ngr: -47213 },
  '2026-02-12|AJ|RLM': { ggr: -52460, bonus: 5190, ngr: -47270 },
  '2026-02-13|AJ|RLM': { ggr: -28860, bonus: 2170, ngr: -26690 },
  '2026-02-14|AJ|RLM': { ggr: 9535, bonus: 2092, ngr: 11627 },
  '2026-02-15|AJ|RLM': { ggr: -23421, bonus: 2398, ngr: -21023 },
  '2026-02-16|AJ|RLM': { ggr: -98335, bonus: 4885, ngr: -93450 },
  '2026-02-17|AJ|RLM': { ggr: -58809, bonus: 1752, ngr: -57057 },
  '2026-02-18|AJ|RLM': { ggr: -21431, bonus: 4511, ngr: -16920 },
  '2026-02-19|AJ|RLM': { ggr: -36871, bonus: 686, ngr: -36185 },
  '2026-02-20|AJ|RLM': { ggr: -17065, bonus: 1888, ngr: -15177 },
  '2026-02-21|AJ|RLM': { ggr: -116322, bonus: 3881, ngr: -112441 },
  '2026-02-22|AJ|RLM': { ggr: 4222, bonus: 1088, ngr: 5310 },
  '2026-02-23|AJ|RLM': { ggr: -22710, bonus: 4602, ngr: -18108 },
  '2026-02-24|AJ|RLM': { ggr: 296802, bonus: 1867, ngr: 298669 },
  // Pepper / RLM
  '2026-02-02|Pepper|RLM': { ggr: 466, bonus: 4309, ngr: 4775 },
  '2026-02-03|Pepper|RLM': { ggr: -17306, bonus: 7827, ngr: -9479 },
  '2026-02-04|Pepper|RLM': { ggr: -38568, bonus: 5180, ngr: -33388 },
  '2026-02-05|Pepper|RLM': { ggr: -63560, bonus: 1498, ngr: -62061 },
  '2026-02-06|Pepper|RLM': { ggr: -727, bonus: 2176, ngr: 1449 },
  '2026-02-07|Pepper|RLM': { ggr: 962, bonus: 152, ngr: 1114 },
  '2026-02-08|Pepper|RLM': { ggr: -6597, bonus: 100, ngr: -6497 },
  '2026-02-09|Pepper|RLM': { ggr: -52894, bonus: 3517, ngr: -49376 },
  '2026-02-10|Pepper|RLM': { ggr: -28488, bonus: 100, ngr: -28388 },
  '2026-02-11|Pepper|RLM': { ggr: -28219, bonus: 1425, ngr: -26794 },
  '2026-02-12|Pepper|RLM': { ggr: -27544, bonus: 962, ngr: -26582 },
  '2026-02-13|Pepper|RLM': { ggr: -27137, bonus: 401, ngr: -26736 },
  '2026-02-14|Pepper|RLM': { ggr: -7176, bonus: 469, ngr: -6708 },
  '2026-02-15|Pepper|RLM': { ggr: -6993, bonus: 350, ngr: -6643 },
  '2026-02-16|Pepper|RLM': { ggr: 18310, bonus: 1394, ngr: 19704 },
  '2026-02-17|Pepper|RLM': { ggr: -68818, bonus: 1102, ngr: -67715 },
  '2026-02-18|Pepper|RLM': { ggr: -1888, bonus: 873, ngr: -1015 },
  '2026-02-19|Pepper|RLM': { ggr: -5425, bonus: 820, ngr: -4605 },
  '2026-02-20|Pepper|RLM': { ggr: 11316, bonus: 156, ngr: 11472 },
  '2026-02-21|Pepper|RLM': { ggr: 24048, bonus: 4032, ngr: 28080 },
  '2026-02-22|Pepper|RLM': { ggr: -18239, bonus: 259, ngr: -17980 },
  '2026-02-23|Pepper|RLM': { ggr: -14241, bonus: 603, ngr: -13639 },
  '2026-02-24|Pepper|RLM': { ggr: -8505, bonus: 1133, ngr: -7372 },
  // Jape / RLM
  '2026-02-02|Jape|RLM': { ggr: -30503, bonus: 1447, ngr: -29056 },
  '2026-02-03|Jape|RLM': { ggr: -17095, bonus: 1211, ngr: -15884 },
  '2026-02-04|Jape|RLM': { ggr: -9535, bonus: 832, ngr: -8703 },
  '2026-02-05|Jape|RLM': { ggr: -17046, bonus: 501, ngr: -16546 },
  '2026-02-06|Jape|RLM': { ggr: 2677, bonus: 637, ngr: 3314 },
  '2026-02-07|Jape|RLM': { ggr: -1125, bonus: 250, ngr: -875 },
  '2026-02-08|Jape|RLM': { ggr: -16493, bonus: 180, ngr: -16313 },
  '2026-02-09|Jape|RLM': { ggr: -21987, bonus: 1935, ngr: -20052 },
  '2026-02-10|Jape|RLM': { ggr: -6538, bonus: 673, ngr: -5865 },
  '2026-02-11|Jape|RLM': { ggr: -17792, bonus: 263, ngr: -17529 },
  '2026-02-12|Jape|RLM': { ggr: 58320, bonus: 20, ngr: 58340 },
  '2026-02-13|Jape|RLM': { ggr: 18974, bonus: 73, ngr: 19047 },
  '2026-02-14|Jape|RLM': { ggr: -24497, bonus: 546, ngr: -23951 },
  '2026-02-15|Jape|RLM': { ggr: -30518, bonus: 175, ngr: -30343 },
  '2026-02-16|Jape|RLM': { ggr: -3344, bonus: 444, ngr: -2899 },
  '2026-02-17|Jape|RLM': { ggr: -10834, bonus: 509, ngr: -10325 },
  '2026-02-18|Jape|RLM': { ggr: -39921, bonus: 7224, ngr: -32696 },
  '2026-02-19|Jape|RLM': { ggr: -24472, bonus: 0, ngr: -24472 },
  '2026-02-20|Jape|RLM': { ggr: -11133, bonus: 10, ngr: -11123 },
  '2026-02-21|Jape|RLM': { ggr: -31102, bonus: 30, ngr: -31072 },
  '2026-02-22|Jape|RLM': { ggr: -16339, bonus: 10, ngr: -16329 },
  '2026-02-23|Jape|RLM': { ggr: 167383, bonus: 10, ngr: 167393 },
  '2026-02-24|Jape|RLM': { ggr: -50460, bonus: 3598, ngr: -46862 },
  // Chad / RLM
  '2026-02-02|Chad|RLM': { ggr: 58190, bonus: 6383, ngr: 64573 },
  '2026-02-03|Chad|RLM': { ggr: -177104, bonus: 2396, ngr: -174708 },
  '2026-02-04|Chad|RLM': { ggr: 57777, bonus: 3130, ngr: 60907 },
  '2026-02-05|Chad|RLM': { ggr: -142046, bonus: 426, ngr: -141620 },
  '2026-02-06|Chad|RLM': { ggr: 33281, bonus: 292, ngr: 33573 },
  '2026-02-07|Chad|RLM': { ggr: -111595, bonus: 10, ngr: -111585 },
  '2026-02-08|Chad|RLM': { ggr: -78010, bonus: 60, ngr: -77950 },
  '2026-02-09|Chad|RLM': { ggr: -25748, bonus: 2242, ngr: -23505 },
  '2026-02-10|Chad|RLM': { ggr: -61834, bonus: 250, ngr: -61584 },
  '2026-02-11|Chad|RLM': { ggr: -103576, bonus: 86, ngr: -103490 },
  '2026-02-12|Chad|RLM': { ggr: 13099, bonus: 140, ngr: 13239 },
  '2026-02-13|Chad|RLM': { ggr: -38490, bonus: 0, ngr: -38490 },
  '2026-02-14|Chad|RLM': { ggr: -15942, bonus: 0, ngr: -15942 },
  '2026-02-15|Chad|RLM': { ggr: 14, bonus: 0, ngr: 14 },
  '2026-02-16|Chad|RLM': { ggr: -7191, bonus: 1010, ngr: -6181 },
  '2026-02-17|Chad|RLM': { ggr: 10971, bonus: 240, ngr: 11211 },
  '2026-02-18|Chad|RLM': { ggr: -6556, bonus: 0, ngr: -6556 },
  '2026-02-19|Chad|RLM': { ggr: 11896, bonus: 106, ngr: 12002 },
  '2026-02-20|Chad|RLM': { ggr: -11407, bonus: 0, ngr: -11407 },
  '2026-02-21|Chad|RLM': { ggr: -2731, bonus: 0, ngr: -2731 },
  '2026-02-22|Chad|RLM': { ggr: -4772, bonus: 56, ngr: -4716 },
  '2026-02-23|Chad|RLM': { ggr: -14877, bonus: 1740, ngr: -13137 },
  '2026-02-24|Chad|RLM': { ggr: -3417, bonus: 150, ngr: -3267 },
  // ChadKinis / RLM
  '2026-02-02|ChadKinis|RLM': { ggr: 105856, bonus: 57281, ngr: 163137 },
  '2026-02-03|ChadKinis|RLM': { ggr: -410028, bonus: 26329, ngr: -383700 },
  '2026-02-04|ChadKinis|RLM': { ggr: -196045, bonus: 34311, ngr: -161734 },
  '2026-02-05|ChadKinis|RLM': { ggr: -283930, bonus: 12680, ngr: -271250 },
  '2026-02-06|ChadKinis|RLM': { ggr: -53989, bonus: 13090, ngr: -40899 },
  '2026-02-07|ChadKinis|RLM': { ggr: -246290, bonus: 13129, ngr: -233162 },
  '2026-02-08|ChadKinis|RLM': { ggr: -68562, bonus: 12013, ngr: -56549 },
  '2026-02-09|ChadKinis|RLM': { ggr: -117303, bonus: 19344, ngr: -97960 },
  '2026-02-10|ChadKinis|RLM': { ggr: 14357, bonus: 26388, ngr: 40745 },
  '2026-02-11|ChadKinis|RLM': { ggr: -125739, bonus: 5339, ngr: -120400 },
  '2026-02-12|ChadKinis|RLM': { ggr: -73058, bonus: 3219, ngr: -69840 },
  '2026-02-13|ChadKinis|RLM': { ggr: -171458, bonus: 8864, ngr: -162594 },
  '2026-02-14|ChadKinis|RLM': { ggr: -183656, bonus: 6578, ngr: -177078 },
  '2026-02-15|ChadKinis|RLM': { ggr: -108220, bonus: 6195, ngr: -102025 },
  '2026-02-16|ChadKinis|RLM': { ggr: -52181, bonus: 36899, ngr: -15282 },
  '2026-02-17|ChadKinis|RLM': { ggr: -85674, bonus: 6447, ngr: -79227 },
  '2026-02-18|ChadKinis|RLM': { ggr: -68649, bonus: 9366, ngr: -59282 },
  '2026-02-19|ChadKinis|RLM': { ggr: -137139, bonus: 6380, ngr: -130760 },
  '2026-02-20|ChadKinis|RLM': { ggr: -218628, bonus: 5978, ngr: -212650 },
  '2026-02-21|ChadKinis|RLM': { ggr: -98431, bonus: 3048, ngr: -95383 },
  '2026-02-22|ChadKinis|RLM': { ggr: 639077, bonus: 11047, ngr: 650124 },
  '2026-02-23|ChadKinis|RLM': { ggr: -132624, bonus: 36290, ngr: -96334 },
  '2026-02-24|ChadKinis|RLM': { ggr: -210521, bonus: 16889, ngr: -193632 },
  '2026-02-25|ChadKinis|RLM': { ggr: -35171, bonus: 7671, ngr: -27500 },
  // Affiliate / RLM
  '2026-02-02|Affiliate|RLM': { ggr: 4768, bonus: 140, ngr: 4908 },
  '2026-02-03|Affiliate|RLM': { ggr: -2831, bonus: 0, ngr: -2831 },
  '2026-02-04|Affiliate|RLM': { ggr: -2872, bonus: 40, ngr: -2832 },
  '2026-02-05|Affiliate|RLM': { ggr: -1223, bonus: 30, ngr: -1193 },
  '2026-02-06|Affiliate|RLM': { ggr: -785, bonus: 42, ngr: -743 },
  '2026-02-07|Affiliate|RLM': { ggr: -101205, bonus: 0, ngr: -101205 },
  '2026-02-08|Affiliate|RLM': { ggr: -4343, bonus: 300, ngr: -4043 },
  '2026-02-09|Affiliate|RLM': { ggr: -2962, bonus: 80, ngr: -2882 },
  '2026-02-10|Affiliate|RLM': { ggr: -144, bonus: 0, ngr: -144 },
  '2026-02-11|Affiliate|RLM': { ggr: -212, bonus: 20, ngr: -192 },
  '2026-02-12|Affiliate|RLM': { ggr: -1065, bonus: 116, ngr: -949 },
  '2026-02-13|Affiliate|RLM': { ggr: -258, bonus: 0, ngr: -258 },
  '2026-02-14|Affiliate|RLM': { ggr: -2287, bonus: 0, ngr: -2287 },
  '2026-02-15|Affiliate|RLM': { ggr: -2553, bonus: 58, ngr: -2495 },
  '2026-02-16|Affiliate|RLM': { ggr: 385, bonus: 20, ngr: 405 },
  '2026-02-17|Affiliate|RLM': { ggr: -749, bonus: 86, ngr: -663 },
  '2026-02-18|Affiliate|RLM': { ggr: -422, bonus: 0, ngr: -422 },
  '2026-02-19|Affiliate|RLM': { ggr: -99710, bonus: 10, ngr: -99700 },
  '2026-02-20|Affiliate|RLM': { ggr: 1020, bonus: 10, ngr: 1030 },
  '2026-02-21|Affiliate|RLM': { ggr: -5586, bonus: 41, ngr: -5545 },
  '2026-02-22|Affiliate|RLM': { ggr: -1681, bonus: 30, ngr: -1651 },
  '2026-02-23|Affiliate|RLM': { ggr: -103834, bonus: 110, ngr: -103724 },
  '2026-02-02|GhostWrecker|WFL': { ggr: 44262, bonus: 1357, ngr: 45619 },
  '2026-02-03|GhostWrecker|WFL': { ggr: 7623, bonus: 5591, ngr: 13214 },
  '2026-02-04|GhostWrecker|WFL': { ggr: -80152, bonus: 2314, ngr: -77838 },
  '2026-02-05|GhostWrecker|WFL': { ggr: 917, bonus: 1795, ngr: 2712 },
  '2026-02-06|GhostWrecker|WFL': { ggr: 55016, bonus: 409, ngr: 55425 },
  '2026-02-07|GhostWrecker|WFL': { ggr: -69263, bonus: 490, ngr: -68773 },
  '2026-02-08|GhostWrecker|WFL': { ggr: 17700, bonus: 990, ngr: 18690 },
  '2026-02-09|GhostWrecker|WFL': { ggr: -57939, bonus: 825, ngr: -57114 },
  '2026-02-10|GhostWrecker|WFL': { ggr: -23465, bonus: 200, ngr: -23265 },
  '2026-02-11|GhostWrecker|WFL': { ggr: 130314, bonus: 45, ngr: 130359 },
  '2026-02-12|GhostWrecker|WFL': { ggr: -267304, bonus: 50, ngr: -267254 },
  '2026-02-13|GhostWrecker|WFL': { ggr: -34239, bonus: 105, ngr: -34134 },
  '2026-02-14|GhostWrecker|WFL': { ggr: -59757, bonus: 261, ngr: -59496 },
  '2026-02-15|GhostWrecker|WFL': { ggr: -42177, bonus: 370, ngr: -41807 },
  '2026-02-16|GhostWrecker|WFL': { ggr: 476, bonus: 690, ngr: 1166 },
  '2026-02-17|GhostWrecker|WFL': { ggr: 42934, bonus: 1151, ngr: 44085 },
  '2026-02-18|GhostWrecker|WFL': { ggr: 17447, bonus: 1090, ngr: 18537 },
  '2026-02-19|GhostWrecker|WFL': { ggr: -86806, bonus: 357, ngr: -86449 },
  '2026-02-20|GhostWrecker|WFL': { ggr: 18209, bonus: 160, ngr: 18369 },
  '2026-02-21|GhostWrecker|WFL': { ggr: -48898, bonus: 367, ngr: -48531 },
  '2026-02-22|GhostWrecker|WFL': { ggr: -47018, bonus: 705, ngr: -46313 },
  '2026-02-23|GhostWrecker|WFL': { ggr: -14287, bonus: 484, ngr: -13803 },
  '2026-02-24|GhostWrecker|WFL': { ggr: 2276, bonus: 305, ngr: 2581 },
  // Jason (JASOON) / WFL
  '2026-02-02|Jason|WFL': { ggr: 28187, bonus: 1295, ngr: 29483 },
  '2026-02-03|Jason|WFL': { ggr: -21140, bonus: 3010, ngr: -18130 },
  '2026-02-04|Jason|WFL': { ggr: -21865, bonus: 873, ngr: -20992 },
  '2026-02-05|Jason|WFL': { ggr: 9850, bonus: 1010, ngr: 10860 },
  '2026-02-06|Jason|WFL': { ggr: -7625, bonus: 210, ngr: -7415 },
  '2026-02-07|Jason|WFL': { ggr: 10782, bonus: 221, ngr: 11003 },
  '2026-02-08|Jason|WFL': { ggr: -48176, bonus: 90, ngr: -48086 },
  '2026-02-09|Jason|WFL': { ggr: -68872, bonus: 30, ngr: -68842 },
  '2026-02-10|Jason|WFL': { ggr: -31619, bonus: 85, ngr: -31534 },
  '2026-02-11|Jason|WFL': { ggr: 5975, bonus: 60, ngr: 6035 },
  '2026-02-12|Jason|WFL': { ggr: 2664, bonus: 0, ngr: 2664 },
  '2026-02-13|Jason|WFL': { ggr: -15945, bonus: 80, ngr: -15865 },
  '2026-02-14|Jason|WFL': { ggr: -18002, bonus: 107, ngr: -17895 },
  '2026-02-15|Jason|WFL': { ggr: 8030, bonus: 0, ngr: 8030 },
  '2026-02-16|Jason|WFL': { ggr: 11863, bonus: 10, ngr: 11873 },
  '2026-02-17|Jason|WFL': { ggr: -2912, bonus: 160, ngr: -2752 },
  '2026-02-18|Jason|WFL': { ggr: -2362, bonus: 130, ngr: -2232 },
  '2026-02-19|Jason|WFL': { ggr: 32776, bonus: 50, ngr: 32826 },
  '2026-02-20|Jason|WFL': { ggr: 1910, bonus: 420, ngr: 2330 },
  '2026-02-21|Jason|WFL': { ggr: -4480, bonus: 80, ngr: -4400 },
  '2026-02-22|Jason|WFL': { ggr: -45388, bonus: 90, ngr: -45298 },
  '2026-02-23|Jason|WFL': { ggr: 15753, bonus: 116, ngr: 15869 },
  '2026-02-24|Jason|WFL': { ggr: -23419, bonus: 150, ngr: -23269 },
  // Neggy (NEGGYTV) / WFL
  '2026-02-02|Neggy|WFL': { ggr: -12516, bonus: 2683, ngr: -9833 },
  '2026-02-03|Neggy|WFL': { ggr: -11444, bonus: 1034, ngr: -10410 },
  '2026-02-04|Neggy|WFL': { ggr: -2349, bonus: 441, ngr: -1908 },
  '2026-02-05|Neggy|WFL': { ggr: -5817, bonus: 2270, ngr: -3547 },
  '2026-02-06|Neggy|WFL': { ggr: -4236, bonus: 120, ngr: -4116 },
  '2026-02-07|Neggy|WFL': { ggr: -5157, bonus: 120, ngr: -5037 },
  '2026-02-08|Neggy|WFL': { ggr: -2764, bonus: 45, ngr: -2719 },
  '2026-02-09|Neggy|WFL': { ggr: -11614, bonus: 30, ngr: -11584 },
  '2026-02-10|Neggy|WFL': { ggr: -2766, bonus: 60, ngr: -2706 },
  '2026-02-11|Neggy|WFL': { ggr: -5338, bonus: 30, ngr: -5308 },
  '2026-02-12|Neggy|WFL': { ggr: 558, bonus: 0, ngr: 558 },
  '2026-02-13|Neggy|WFL': { ggr: -3735, bonus: 150, ngr: -3585 },
  '2026-02-14|Neggy|WFL': { ggr: -6422, bonus: 0, ngr: -6422 },
  '2026-02-15|Neggy|WFL': { ggr: -3835, bonus: 0, ngr: -3835 },
  '2026-02-16|Neggy|WFL': { ggr: -7736, bonus: 0, ngr: -7736 },
  '2026-02-17|Neggy|WFL': { ggr: -3732, bonus: 1030, ngr: -2702 },
  '2026-02-18|Neggy|WFL': { ggr: -256, bonus: 30, ngr: -226 },
  '2026-02-19|Neggy|WFL': { ggr: 395, bonus: 30, ngr: 425 },
  '2026-02-20|Neggy|WFL': { ggr: -164, bonus: 0, ngr: -164 },
  '2026-02-21|Neggy|WFL': { ggr: -669, bonus: 0, ngr: -669 },
  '2026-02-22|Neggy|WFL': { ggr: 2768, bonus: 0, ngr: 2768 },
  '2026-02-23|Neggy|WFL': { ggr: -8614, bonus: 0, ngr: -8614 },
  '2026-02-24|Neggy|WFL': { ggr: -1217, bonus: 0, ngr: -1217 },
  // Aether (WOOLFYBETS) / WFL
  '2026-02-02|Aether|WFL': { ggr: 2307, bonus: 1120, ngr: 3427 },
  '2026-02-03|Aether|WFL': { ggr: -18251, bonus: 448, ngr: -17803 },
  '2026-02-04|Aether|WFL': { ggr: -240, bonus: 230, ngr: -10 },
  '2026-02-05|Aether|WFL': { ggr: -684, bonus: 228, ngr: -455 },
  '2026-02-06|Aether|WFL': { ggr: -1900, bonus: 60, ngr: -1840 },
  '2026-02-07|Aether|WFL': { ggr: -379, bonus: 570, ngr: 191 },
  '2026-02-08|Aether|WFL': { ggr: -2480, bonus: 30, ngr: -2450 },
  '2026-02-09|Aether|WFL': { ggr: -3356, bonus: 0, ngr: -3356 },
  '2026-02-10|Aether|WFL': { ggr: -332, bonus: 0, ngr: -332 },
  '2026-02-11|Aether|WFL': { ggr: 7287, bonus: 0, ngr: 7287 },
  '2026-02-12|Aether|WFL': { ggr: 2331, bonus: 50, ngr: 2381 },
  '2026-02-13|Aether|WFL': { ggr: -155, bonus: 30, ngr: -125 },
  '2026-02-14|Aether|WFL': { ggr: 2938, bonus: 0, ngr: 2938 },
  '2026-02-15|Aether|WFL': { ggr: -90392, bonus: 50, ngr: -90342 },
  '2026-02-16|Aether|WFL': { ggr: -4977, bonus: 0, ngr: -4977 },
  '2026-02-17|Aether|WFL': { ggr: -1500, bonus: 0, ngr: -1500 },
  '2026-02-18|Aether|WFL': { ggr: 5295, bonus: 0, ngr: 5295 },
  '2026-02-19|Aether|WFL': { ggr: 982, bonus: 1030, ngr: 2012 },
  '2026-02-20|Aether|WFL': { ggr: 3709, bonus: 30, ngr: 3739 },
  '2026-02-21|Aether|WFL': { ggr: 7888, bonus: 150, ngr: 8038 },
  '2026-02-22|Aether|WFL': { ggr: 4055, bonus: 1560, ngr: 5615 },
  '2026-02-23|Aether|WFL': { ggr: -23220, bonus: 0, ngr: -23220 },
  '2026-02-24|Aether|WFL': { ggr: -1718, bonus: 229, ngr: -1489 },
  // Dogie / T2B
  '2026-02-02|Dogie|T2B': { ggr: -550146, bonus: 123693, ngr: -426453 },
  '2026-02-03|Dogie|T2B': { ggr: -366632, bonus: 92482, ngr: -274151 },
  '2026-02-04|Dogie|T2B': { ggr: -1000568, bonus: 127943, ngr: -872625 },
  '2026-02-05|Dogie|T2B': { ggr: -612702, bonus: 142264, ngr: -470438 },
  '2026-02-06|Dogie|T2B': { ggr: -576739, bonus: 107737, ngr: -469003 },
  '2026-02-07|Dogie|T2B': { ggr: -790382, bonus: 89863, ngr: -700519 },
  '2026-02-08|Dogie|T2B': { ggr: -325466, bonus: 105218, ngr: -220247 },
  '2026-02-09|Dogie|T2B': { ggr: -897609, bonus: 87987, ngr: -809621 },
  '2026-02-10|Dogie|T2B': { ggr: -730996, bonus: 82742, ngr: -648254 },
  '2026-02-11|Dogie|T2B': { ggr: -122777, bonus: 72278, ngr: -50499 },
  '2026-02-12|Dogie|T2B': { ggr: -931643, bonus: 77611, ngr: -854032 },
  '2026-02-13|Dogie|T2B': { ggr: -906118, bonus: 93179, ngr: -812940 },
  '2026-02-14|Dogie|T2B': { ggr: -165319, bonus: 72859, ngr: -92460 },
  '2026-02-15|Dogie|T2B': { ggr: -711414, bonus: 83111, ngr: -628303 },
  '2026-02-16|Dogie|T2B': { ggr: -797924, bonus: 77409, ngr: -720515 },
  '2026-02-17|Dogie|T2B': { ggr: -127029, bonus: 114099, ngr: -12930 },
  '2026-02-18|Dogie|T2B': { ggr: -422870, bonus: 95374, ngr: -327496 },
  '2026-02-19|Dogie|T2B': { ggr: -1056525, bonus: 75895, ngr: -980630 },
  '2026-02-20|Dogie|T2B': { ggr: -945467, bonus: 93205, ngr: -852262 },
  '2026-02-21|Dogie|T2B': { ggr: -460328, bonus: 69675, ngr: -390653 },
  '2026-02-22|Dogie|T2B': { ggr: -707759, bonus: 71426, ngr: -636333 },
  '2026-02-23|Dogie|T2B': { ggr: 206704, bonus: 68018, ngr: 274722 },
  '2026-02-24|Dogie|T2B': { ggr: -498467, bonus: 73828, ngr: -424638 },
  // Renejay / T2B
  '2026-02-02|Renejay|T2B': { ggr: -44224, bonus: 9795, ngr: -34429 },
  '2026-02-03|Renejay|T2B': { ggr: -41889, bonus: 1077, ngr: -40811 },
  '2026-02-04|Renejay|T2B': { ggr: -15801, bonus: 3292, ngr: -12509 },
  '2026-02-05|Renejay|T2B': { ggr: -16728, bonus: 9506, ngr: -7223 },
  '2026-02-06|Renejay|T2B': { ggr: -33382, bonus: 2594, ngr: -30788 },
  '2026-02-07|Renejay|T2B': { ggr: -65917, bonus: 15501, ngr: -50415 },
  '2026-02-08|Renejay|T2B': { ggr: -44258, bonus: 11885, ngr: -32373 },
  '2026-02-09|Renejay|T2B': { ggr: -37345, bonus: 4087, ngr: -33257 },
  '2026-02-10|Renejay|T2B': { ggr: 52849, bonus: 37549, ngr: 90398 },
  '2026-02-11|Renejay|T2B': { ggr: -45446, bonus: 17776, ngr: -27670 },
  '2026-02-12|Renejay|T2B': { ggr: -113631, bonus: 19098, ngr: -94532 },
  '2026-02-13|Renejay|T2B': { ggr: -76027, bonus: 22324, ngr: -53703 },
  '2026-02-14|Renejay|T2B': { ggr: -145752, bonus: 15482, ngr: -130271 },
  '2026-02-15|Renejay|T2B': { ggr: 185570, bonus: 23654, ngr: 209224 },
  '2026-02-16|Renejay|T2B': { ggr: 179055, bonus: 30117, ngr: 209173 },
  '2026-02-17|Renejay|T2B': { ggr: -234851, bonus: 36060, ngr: -198791 },
  '2026-02-18|Renejay|T2B': { ggr: -277158, bonus: 26412, ngr: -250745 },
  '2026-02-19|Renejay|T2B': { ggr: -237017, bonus: 21822, ngr: -215195 },
  '2026-02-20|Renejay|T2B': { ggr: -22310, bonus: 26458, ngr: 4147 },
  '2026-02-21|Renejay|T2B': { ggr: -159876, bonus: 19712, ngr: -140164 },
  '2026-02-22|Renejay|T2B': { ggr: -112590, bonus: 16711, ngr: -95879 },
  '2026-02-23|Renejay|T2B': { ggr: -135664, bonus: 16315, ngr: -119350 },
  '2026-02-24|Renejay|T2B': { ggr: -185289, bonus: 12892, ngr: -172397 },
  // H2wo / T2B
  '2026-02-02|H2wo|T2B': { ggr: 44948, bonus: 29676, ngr: 74624 },
  '2026-02-03|H2wo|T2B': { ggr: -204261, bonus: 21528, ngr: -182733 },
  '2026-02-04|H2wo|T2B': { ggr: -110160, bonus: 16432, ngr: -93728 },
  '2026-02-05|H2wo|T2B': { ggr: -50025, bonus: 19002, ngr: -31023 },
  '2026-02-06|H2wo|T2B': { ggr: -79503, bonus: 14287, ngr: -65216 },
  '2026-02-07|H2wo|T2B': { ggr: -64460, bonus: 11030, ngr: -53429 },
  '2026-02-08|H2wo|T2B': { ggr: 2803, bonus: 14292, ngr: 17095 },
  '2026-02-09|H2wo|T2B': { ggr: -171988, bonus: 8736, ngr: -163252 },
  '2026-02-10|H2wo|T2B': { ggr: -37111, bonus: 27585, ngr: -9526 },
  '2026-02-11|H2wo|T2B': { ggr: -32742, bonus: 11350, ngr: -21393 },
  '2026-02-12|H2wo|T2B': { ggr: -135942, bonus: 13928, ngr: -122014 },
  '2026-02-13|H2wo|T2B': { ggr: -56184, bonus: 10968, ngr: -45216 },
  '2026-02-14|H2wo|T2B': { ggr: -32333, bonus: 7293, ngr: -25041 },
  '2026-02-15|H2wo|T2B': { ggr: -80404, bonus: 12958, ngr: -67446 },
  '2026-02-16|H2wo|T2B': { ggr: -30000, bonus: 12950, ngr: -17050 },
  '2026-02-17|H2wo|T2B': { ggr: -100150, bonus: 12659, ngr: -87491 },
  '2026-02-18|H2wo|T2B': { ggr: -71568, bonus: 11565, ngr: -60002 },
  '2026-02-19|H2wo|T2B': { ggr: -33710, bonus: 18410, ngr: -15300 },
  '2026-02-20|H2wo|T2B': { ggr: -117411, bonus: 27356, ngr: -90055 },
  '2026-02-21|H2wo|T2B': { ggr: -148779, bonus: 23643, ngr: -125136 },
  '2026-02-22|H2wo|T2B': { ggr: -66368, bonus: 15050, ngr: -51318 },
  '2026-02-23|H2wo|T2B': { ggr: -100459, bonus: 9500, ngr: -90959 },
  '2026-02-24|H2wo|T2B': { ggr: 33513, bonus: 20333, ngr: 53847 },
  // Yawi / T2B
  '2026-02-02|Yawi|T2B': { ggr: -15016, bonus: 26648, ngr: 11632 },
  '2026-02-03|Yawi|T2B': { ggr: -90883, bonus: 7518, ngr: -83365 },
  '2026-02-04|Yawi|T2B': { ggr: -14806, bonus: 5419, ngr: -9387 },
  '2026-02-05|Yawi|T2B': { ggr: -53731, bonus: 6583, ngr: -47148 },
  '2026-02-06|Yawi|T2B': { ggr: -77302, bonus: 6972, ngr: -70330 },
  '2026-02-07|Yawi|T2B': { ggr: -49805, bonus: 7955, ngr: -41850 },
  '2026-02-08|Yawi|T2B': { ggr: -78772, bonus: 4562, ngr: -74210 },
  '2026-02-09|Yawi|T2B': { ggr: -83798, bonus: 6242, ngr: -77556 },
  '2026-02-10|Yawi|T2B': { ggr: -36607, bonus: 8362, ngr: -28244 },
  '2026-02-11|Yawi|T2B': { ggr: -47586, bonus: 5510, ngr: -42076 },
  '2026-02-12|Yawi|T2B': { ggr: 10515, bonus: 7441, ngr: 17956 },
  '2026-02-13|Yawi|T2B': { ggr: -78059, bonus: 7789, ngr: -70270 },
  '2026-02-14|Yawi|T2B': { ggr: -47497, bonus: 7098, ngr: -40399 },
  '2026-02-15|Yawi|T2B': { ggr: -112329, bonus: 18835, ngr: -93495 },
  '2026-02-16|Yawi|T2B': { ggr: -37889, bonus: 6752, ngr: -31137 },
  '2026-02-17|Yawi|T2B': { ggr: -71595, bonus: 6634, ngr: -64961 },
  '2026-02-18|Yawi|T2B': { ggr: -65359, bonus: 6751, ngr: -58608 },
  '2026-02-19|Yawi|T2B': { ggr: 27821, bonus: 11415, ngr: 39236 },
  '2026-02-20|Yawi|T2B': { ggr: -21316, bonus: 13434, ngr: -7882 },
  '2026-02-21|Yawi|T2B': { ggr: 279147, bonus: 10739, ngr: 289887 },
  '2026-02-22|Yawi|T2B': { ggr: -395699, bonus: 11724, ngr: -383975 },
  '2026-02-23|Yawi|T2B': { ggr: -62409, bonus: 9350, ngr: -53058 },
  '2026-02-24|Yawi|T2B': { ggr: -21914, bonus: 5774, ngr: -16140 },
  // Zico / T2B
  '2026-02-02|Zico|T2B': { ggr: -424, bonus: 8747, ngr: 8323 },
  '2026-02-03|Zico|T2B': { ggr: -4691, bonus: 1099, ngr: -3592 },
  '2026-02-04|Zico|T2B': { ggr: -5550, bonus: 720, ngr: -4830 },
  '2026-02-05|Zico|T2B': { ggr: -28649, bonus: 4990, ngr: -23659 },
  '2026-02-06|Zico|T2B': { ggr: -1782, bonus: 893, ngr: -889 },
  '2026-02-07|Zico|T2B': { ggr: -886, bonus: 40, ngr: -846 },
  '2026-02-08|Zico|T2B': { ggr: -1840, bonus: 140, ngr: -1700 },
  '2026-02-09|Zico|T2B': { ggr: -7493, bonus: 0, ngr: -7493 },
  '2026-02-10|Zico|T2B': { ggr: 1478, bonus: 120, ngr: 1598 },
  '2026-02-11|Zico|T2B': { ggr: 11856, bonus: 70, ngr: 11926 },
  '2026-02-12|Zico|T2B': { ggr: -238, bonus: 310, ngr: 72 },
  '2026-02-13|Zico|T2B': { ggr: -1518, bonus: 0, ngr: -1518 },
  '2026-02-14|Zico|T2B': { ggr: -2705, bonus: 2040, ngr: -665 },
  '2026-02-15|Zico|T2B': { ggr: 43040, bonus: 696, ngr: 43736 },
  '2026-02-16|Zico|T2B': { ggr: 15424, bonus: 4906, ngr: 20329 },
  '2026-02-17|Zico|T2B': { ggr: -29193, bonus: 9822, ngr: -19370 },
  '2026-02-18|Zico|T2B': { ggr: -4097, bonus: 71, ngr: -4026 },
  '2026-02-19|Zico|T2B': { ggr: -1980, bonus: 256, ngr: -1724 },
  '2026-02-20|Zico|T2B': { ggr: -2005, bonus: 0, ngr: -2005 },
  '2026-02-21|Zico|T2B': { ggr: -3054, bonus: 125, ngr: -2929 },
  '2026-02-22|Zico|T2B': { ggr: -2820, bonus: 320, ngr: -2500 },
  '2026-02-23|Zico|T2B': { ggr: -7401, bonus: 2550, ngr: -4851 },
  '2026-02-24|Zico|T2B': { ggr: -4914, bonus: 85, ngr: -4829 },
  // Jape / T2B
  '2026-02-02|Jape|T2B': { ggr: -21111, bonus: 839, ngr: -20272 },
  '2026-02-03|Jape|T2B': { ggr: 2612, bonus: 1034, ngr: 3645 },
  '2026-02-04|Jape|T2B': { ggr: 621, bonus: 1618, ngr: 2238 },
  '2026-02-05|Jape|T2B': { ggr: -18245, bonus: 1436, ngr: -16808 },
  '2026-02-06|Jape|T2B': { ggr: -18667, bonus: 2378, ngr: -16289 },
  '2026-02-07|Jape|T2B': { ggr: 912, bonus: 1577, ngr: 2489 },
  '2026-02-08|Jape|T2B': { ggr: -13758, bonus: 809, ngr: -12949 },
  '2026-02-09|Jape|T2B': { ggr: 50923, bonus: 796, ngr: 51719 },
  '2026-02-10|Jape|T2B': { ggr: 9067, bonus: 1147, ngr: 10214 },
  '2026-02-11|Jape|T2B': { ggr: -29883, bonus: 1333, ngr: -28549 },
  '2026-02-12|Jape|T2B': { ggr: -15266, bonus: 861, ngr: -14405 },
  '2026-02-13|Jape|T2B': { ggr: -26200, bonus: 989, ngr: -25211 },
  '2026-02-14|Jape|T2B': { ggr: -8164, bonus: 3112, ngr: -5052 },
  '2026-02-15|Jape|T2B': { ggr: -27889, bonus: 799, ngr: -27090 },
  '2026-02-16|Jape|T2B': { ggr: -26829, bonus: 1087, ngr: -25743 },
  '2026-02-17|Jape|T2B': { ggr: 130632, bonus: 1734, ngr: 132367 },
  '2026-02-18|Jape|T2B': { ggr: -17181, bonus: 1543, ngr: -15638 },
  '2026-02-19|Jape|T2B': { ggr: -70386, bonus: 1347, ngr: -69039 },
  '2026-02-20|Jape|T2B': { ggr: -96068, bonus: 2180, ngr: -93888 },
  '2026-02-21|Jape|T2B': { ggr: -31924, bonus: 1311, ngr: -30613 },
  '2026-02-22|Jape|T2B': { ggr: -21631, bonus: 1471, ngr: -20160 },
  '2026-02-23|Jape|T2B': { ggr: 10869, bonus: 1571, ngr: 12440 },
  '2026-02-24|Jape|T2B': { ggr: 18915, bonus: 2696, ngr: 21611 },
  // Ribo / T2B
  '2026-02-03|Ribo|T2B': { ggr: 374, bonus: 0, ngr: 374 },
  '2026-02-04|Ribo|T2B': { ggr: -5341, bonus: 370, ngr: -4971 },
  '2026-02-05|Ribo|T2B': { ggr: -1350, bonus: 394, ngr: -955 },
  '2026-02-06|Ribo|T2B': { ggr: -5940, bonus: 900, ngr: -5040 },
  '2026-02-07|Ribo|T2B': { ggr: -6517, bonus: 720, ngr: -5797 },
  '2026-02-08|Ribo|T2B': { ggr: -765, bonus: 200, ngr: -565 },
  '2026-02-09|Ribo|T2B': { ggr: -7886, bonus: 322, ngr: -7564 },
  '2026-02-10|Ribo|T2B': { ggr: -19262, bonus: 1980, ngr: -17282 },
  '2026-02-11|Ribo|T2B': { ggr: -7931, bonus: 1420, ngr: -6511 },
  '2026-02-12|Ribo|T2B': { ggr: -8754, bonus: 1003, ngr: -7751 },
  '2026-02-13|Ribo|T2B': { ggr: -3878, bonus: 576, ngr: -3302 },
  '2026-02-14|Ribo|T2B': { ggr: -6615, bonus: 280, ngr: -6335 },
  '2026-02-15|Ribo|T2B': { ggr: 3482, bonus: 206, ngr: 3688 },
  '2026-02-16|Ribo|T2B': { ggr: -3657, bonus: 550, ngr: -3107 },
  '2026-02-17|Ribo|T2B': { ggr: -2998, bonus: 979, ngr: -2020 },
  '2026-02-18|Ribo|T2B': { ggr: -5868, bonus: 470, ngr: -5398 },
  '2026-02-19|Ribo|T2B': { ggr: -2946, bonus: 485, ngr: -2461 },
  '2026-02-20|Ribo|T2B': { ggr: -1396, bonus: 830, ngr: -566 },
  '2026-02-21|Ribo|T2B': { ggr: 2324, bonus: 540, ngr: 2864 },
  '2026-02-22|Ribo|T2B': { ggr: 9111, bonus: 480, ngr: 9591 },
  '2026-02-23|Ribo|T2B': { ggr: -5879, bonus: 843, ngr: -5037 },
  '2026-02-24|Ribo|T2B': { ggr: -19564, bonus: 430, ngr: -19134 },
  // Krilla / T2B
  '2026-02-23|Krilla|T2B': { ggr: -249, bonus: 150, ngr: -99 },
  '2026-02-24|Krilla|T2B': { ggr: -699, bonus: 200, ngr: -499 },
  // Yuji / T2B
  '2026-02-07|Yuji|T2B': { ggr: -889, bonus: 0, ngr: -889 },
  '2026-02-08|Yuji|T2B': { ggr: -18297, bonus: 50, ngr: -18247 },
  '2026-02-09|Yuji|T2B': { ggr: -1178, bonus: 0, ngr: -1178 },
  '2026-02-10|Yuji|T2B': { ggr: -499, bonus: 0, ngr: -499 },
  '2026-02-11|Yuji|T2B': { ggr: -1660, bonus: 375, ngr: -1285 },
  '2026-02-12|Yuji|T2B': { ggr: 19088, bonus: 744, ngr: 19832 },
  '2026-02-13|Yuji|T2B': { ggr: 2204, bonus: 620, ngr: 2824 },
  '2026-02-14|Yuji|T2B': { ggr: -6965, bonus: 388, ngr: -6577 },
  '2026-02-15|Yuji|T2B': { ggr: -1136, bonus: 50, ngr: -1086 },
  '2026-02-16|Yuji|T2B': { ggr: -150, bonus: 190, ngr: 40 },
  '2026-02-17|Yuji|T2B': { ggr: -5424, bonus: 0, ngr: -5424 },
  '2026-02-18|Yuji|T2B': { ggr: -1765, bonus: 540, ngr: -1225 },
  '2026-02-19|Yuji|T2B': { ggr: -4146, bonus: 180, ngr: -3966 },
  '2026-02-20|Yuji|T2B': { ggr: -3800, bonus: 393, ngr: -3407 },
  '2026-02-21|Yuji|T2B': { ggr: -909, bonus: 160, ngr: -749 },
  '2026-02-22|Yuji|T2B': { ggr: -1382, bonus: 20, ngr: -1362 },
  '2026-02-23|Yuji|T2B': { ggr: 687, bonus: 170, ngr: 857 },
  '2026-02-24|Yuji|T2B': { ggr: -699, bonus: 200, ngr: -499 },
  // Wrecker / T2B
  '2026-02-09|Wrecker|T2B': { ggr: -1979, bonus: 470, ngr: -1509 },
  '2026-02-10|Wrecker|T2B': { ggr: -9550, bonus: 2948, ngr: -6602 },
  '2026-02-11|Wrecker|T2B': { ggr: -9995, bonus: 1393, ngr: -8601 },
  '2026-02-12|Wrecker|T2B': { ggr: -26929, bonus: 860, ngr: -26069 },
  '2026-02-13|Wrecker|T2B': { ggr: -8211, bonus: 1803, ngr: -6408 },
  '2026-02-14|Wrecker|T2B': { ggr: -1775, bonus: 377, ngr: -1399 },
  '2026-02-15|Wrecker|T2B': { ggr: -6213, bonus: 370, ngr: -5843 },
  '2026-02-16|Wrecker|T2B': { ggr: -1463, bonus: 68, ngr: -1395 },
  '2026-02-17|Wrecker|T2B': { ggr: -1199, bonus: 100, ngr: -1099 },
  '2026-02-18|Wrecker|T2B': { ggr: -4795, bonus: 1200, ngr: -3595 },
  '2026-02-19|Wrecker|T2B': { ggr: 25955, bonus: 1312, ngr: 27267 },
  '2026-02-20|Wrecker|T2B': { ggr: -5156, bonus: 175, ngr: -4981 },
  '2026-02-21|Wrecker|T2B': { ggr: -4858, bonus: 660, ngr: -4198 },
  '2026-02-22|Wrecker|T2B': { ggr: -5019, bonus: 825, ngr: -4194 },
  '2026-02-23|Wrecker|T2B': { ggr: -5364, bonus: 3120, ngr: -2244 },
  '2026-02-24|Wrecker|T2B': { ggr: -7000, bonus: 7000, ngr: 0 },
  // Trixie / T2B
  '2026-02-21|Trixie|T2B': { ggr: -643, bonus: 250, ngr: -393 },
  '2026-02-22|Trixie|T2B': { ggr: -6448, bonus: 1194, ngr: -5254 },
  '2026-02-23|Trixie|T2B': { ggr: -1061, bonus: 978, ngr: -83 },
  '2026-02-24|Trixie|T2B': { ggr: -7000, bonus: 1422, ngr: -5577 },
};

export default function App() {
  // --- DATA STATE ---
  // MODE A (no Firebase): loads rawData + any localStorage additions immediately
  // MODE B (Firebase configured): real-time Firestore sync across all devices
  const [data, setData] = useState(() => {
    if (FIREBASE_CONFIGURED) return [];
    try {
      const saved = localStorage.getItem('campaignData_v4');
      return saved ? JSON.parse(saved) : rawData;
    } catch { return rawData; }
  });
  const [loading, setLoading] = useState(FIREBASE_CONFIGURED);

  // Persist to localStorage in offline mode
  useEffect(() => {
    if (!FIREBASE_CONFIGURED) {
      localStorage.setItem('campaignData_v4', JSON.stringify(data));
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
      // Seed any rawData entries whose site doesn't exist in Firestore yet
      const existingSites = new Set(entries.map(e => e.site));
      const missingSiteEntries = rawData.filter(e => !existingSites.has(e.site));
      if (missingSiteEntries.length > 0) {
        for (const chunk of chunkArray(missingSiteEntries)) {
          const batch = writeBatch(db);
          chunk.forEach(entry => batch.set(doc(collection(db, 'entries')), entry));
          await batch.commit();
        }
        return; // snapshot will re-fire with new data
      }
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
    if (FIREBASE_CONFIGURED) return defaultCreatorPerfData;
    try {
      const saved = localStorage.getItem('creatorPerfData');
      return saved ? { ...defaultCreatorPerfData, ...JSON.parse(saved) } : defaultCreatorPerfData;
    } catch { return defaultCreatorPerfData; }
  });

  useEffect(() => {
    if (!FIREBASE_CONFIGURED) {
      localStorage.setItem('creatorPerfData', JSON.stringify(creatorPerfData));
    }
  }, [creatorPerfData]);

  useEffect(() => {
    if (!FIREBASE_CONFIGURED) return;
    const unsub = onSnapshot(doc(db, 'config', 'creatorPerf'), async (snap) => {
      if (snap.exists()) {
        // Merge defaults (lower priority) with saved Firebase data (higher priority)
        setCreatorPerfData({ ...defaultCreatorPerfData, ...snap.data() });
      } else {
        // Seed Firebase with default data on first run
        await setDoc(doc(db, 'config', 'creatorPerf'), defaultCreatorPerfData);
        setCreatorPerfData(defaultCreatorPerfData);
      }
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

  // --- CREATOR SUMMARY (lifted for header cards) ---
  const [creatorSummary, setCreatorSummary] = useState({ spend: 0, dep: 0, ngr: 0, efficacyRate: null });

  // --- CREATOR PERF MODAL STATE ---
  const [showCreatorPerfModal, setShowCreatorPerfModal] = useState(false);
  const [creatorPerfEditKey, setCreatorPerfEditKey] = useState(null);
  const [creatorPerfLabel, setCreatorPerfLabel] = useState('');
  const emptyCreatorPerfForm = { ggr: '', bonus: '', ngr: '', activePl: '', validTurnover: '', totalWithdrawal: '' };
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
      activePl: existing.activePl !== undefined ? String(existing.activePl) : '',
      validTurnover: existing.validTurnover !== undefined ? String(existing.validTurnover) : '',
      totalWithdrawal: existing.totalWithdrawal !== undefined ? String(existing.totalWithdrawal) : '',
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
        activePl: parseFloat(creatorPerfFormValues.activePl) || 0,
        validTurnover: parseFloat(creatorPerfFormValues.validTurnover) || 0,
        totalWithdrawal: parseFloat(creatorPerfFormValues.totalWithdrawal) || 0,
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

  const handleDeleteDay = async (dayEntries) => {
    if (window.confirm(`Delete all ${dayEntries.length} entr${dayEntries.length === 1 ? 'y' : 'ies'} for this day?`)) {
      if (FIREBASE_CONFIGURED) {
        const batch = writeBatch(db);
        dayEntries.forEach(entry => batch.delete(doc(db, 'entries', entry.id)));
        await batch.commit();
      } else {
        setData(prev => prev.filter(d => !dayEntries.includes(d)));
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
      if (item.site === 'PP') return false;
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

  // Global NGR from creatorPerfData within date range + matching filters
  const globalCreatorNGR = useMemo(() => {
    return Object.entries(creatorPerfData).reduce((sum, [key, val]) => {
      const [date, streamer, site] = key.split('|');
      if (date < startDate || date > endDate) return sum;
      if (filterSite !== 'All' && site !== filterSite) return sum;
      if (filterStreamer !== 'All' && streamer !== filterStreamer) return sum;
      return sum + (parseFloat(val.ngr) || 0);
    }, 0);
  }, [creatorPerfData, startDate, endDate, filterSite, filterStreamer]);

  const globalEfficacyRate = totals.spend > 0 ? (globalCreatorNGR / totals.spend) * 100 : null;

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
  const sites = [...new Set([...data.map(d => d.site), 'COW', 'T2B'])].filter(s => s !== 'PP').sort();
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

              {activeView !== 'creatorReport' && (
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
              )}
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
              title="Total Ad Spend"
              value={formatPHP(totals.spend)}
              icon={<ArrowDownRight className="text-red-500" size={16} />}
              color="border-l-4 border-red-500"
            />
            <MetricCard
              title="Total Deposit"
              value={formatPHP(totals.dep)}
              icon={<ArrowUpRight className="text-emerald-500" size={16} />}
              color="border-l-4 border-emerald-500"
            />
            <MetricCard
              title="Total NGR"
              value={formatPHP(globalCreatorNGR)}
              icon={<DollarSign className={globalCreatorNGR >= 0 ? "text-indigo-500" : "text-red-500"} size={16} />}
              color={globalCreatorNGR >= 0 ? "border-l-4 border-indigo-500" : "border-l-4 border-red-500"}
            />
            <MetricCard
              title="Efficacy Rate"
              value={globalEfficacyRate !== null ? `${globalEfficacyRate.toFixed(2)}%` : 'N/A'}
              icon={<TrendingUp className={globalEfficacyRate !== null && globalEfficacyRate >= 100 ? "text-emerald-600" : "text-amber-500"} size={16} />}
              subValue="NGR ÷ Ad Spend"
              color={globalEfficacyRate !== null && globalEfficacyRate >= 100 ? "border-l-4 border-emerald-600" : "border-l-4 border-amber-400"}
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
                          item.site === 'RLM' ? 'bg-purple-100 text-purple-700' :
                          item.site === 'COW' ? 'bg-teal-100 text-teal-700' :
                          item.site === 'T2B' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
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
          onSummaryChange={setCreatorSummary}
          formatPHP={formatPHP}
          streamers={streamers}
          sites={sites}
          onAddEntry={(streamer, site) => {
            setEditingId(null);
            setFormValues({ ...emptyForm, date: new Date().toISOString().split('T')[0], streamer, site: (site && site !== 'All') ? site : 'WFL' });
            setShowModal(true);
          }}
          onEditEntry={openEditModal}
          onDeleteEntry={handleDelete}
          onDeleteDay={handleDeleteDay}
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
                    <option>WFL</option><option>RLM</option><option>COW</option><option>T2B</option>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Edit Daily EOD Data</h2>
              <button onClick={() => setShowCreatorPerfModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 mb-4">
              <p className="text-xs font-bold text-indigo-700 tracking-wider">{creatorPerfLabel}</p>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active PL</label>
                  <input type="number" value={creatorPerfFormValues.activePl} onChange={e => setCreatorPerfFormValues({...creatorPerfFormValues, activePl: e.target.value})} placeholder="0" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Valid Turnover</label>
                  <input type="number" value={creatorPerfFormValues.validTurnover} onChange={e => setCreatorPerfFormValues({...creatorPerfFormValues, validTurnover: e.target.value})} placeholder="0" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">GGR (Win/Loss)</label>
                  <input type="number" value={creatorPerfFormValues.ggr} onChange={e => setCreatorPerfFormValues({...creatorPerfFormValues, ggr: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bonus</label>
                  <input type="number" value={creatorPerfFormValues.bonus} onChange={e => setCreatorPerfFormValues({...creatorPerfFormValues, bonus: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">NGR</label>
                  <input type="number" value={creatorPerfFormValues.ngr} onChange={e => setCreatorPerfFormValues({...creatorPerfFormValues, ngr: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                  <p className="text-[10px] text-slate-400 mt-1">Efficacy = NGR ÷ Ad Spend</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Withdrawal</label>
                  <input type="number" value={creatorPerfFormValues.totalWithdrawal} onChange={e => setCreatorPerfFormValues({...creatorPerfFormValues, totalWithdrawal: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
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

  const SITE_LABELS = { WFL: 'WINFORLIFE', RLM: 'ROLLEM', COW: 'COW', T2B: 'T2B' };
  const getAds = (site, streamer, type) => adsReportData[`${site}|${streamer}|${type}`] || { ggr: 0, bonus: 0, ngr: 0, boosting: 0 };

  const fmtVal = (val) => {
    const n = parseFloat(val) || 0;
    if (n === 0) return '0';
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  };

  const siteOrder = ['WFL', 'RLM'].filter(s => grouped[s]);

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
        const colorCls = site === 'WFL' ? 'bg-blue-600' : site === 'RLM' ? 'bg-purple-600' : site === 'COW' ? 'bg-teal-600' : site === 'T2B' ? 'bg-rose-600' : 'bg-slate-600';
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
function CreatorReportView({ data, startDate, endDate, creatorPerfData, onEdit, onSummaryChange, formatPHP, streamers, sites, onAddEntry, onEditEntry, onDeleteEntry, onDeleteDay }) {
  const [selectedStreamer, setSelectedStreamer] = React.useState(streamers[0] || '');
  const [selectedSite, setSelectedSite] = React.useState('All');
  const [expandedRow, setExpandedRow] = React.useState(null);

  // Filter data for the selected creator
  const creatorEntries = data.filter(d =>
    d.streamer === selectedStreamer &&
    d.date >= startDate &&
    d.date <= endDate &&
    (selectedSite === 'All' || d.site === selectedSite)
  );

  // Get dates where this creator has entries
  const creatorDates = [...new Set(creatorEntries.map(d => d.date))].sort();

  // Build per-day rows (include dayEntries for inline editing)
  const rows = creatorDates.map(date => {
    const dayEntries = creatorEntries.filter(e => e.date === date);
    const totalSpend = dayEntries.reduce((s, e) => s + e.spend, 0);
    const totalDep = dayEntries.reduce((s, e) => s + e.dep, 0);
    const totalReg = dayEntries.reduce((s, e) => s + e.reg, 0);
    const siteName = dayEntries[0]?.site || '';
    const key = `${date}|${selectedStreamer}|${siteName}`;
    const perf = creatorPerfData[key] || { ggr: 0, bonus: 0, ngr: 0, activePl: 0, validTurnover: 0, totalWithdrawal: 0 };
    const efficacyRate = totalSpend > 0 ? (perf.ngr / totalSpend) * 100 : null;
    return { date, siteName, totalSpend, totalDep, totalReg, ...perf, efficacyRate, key, dayEntries };
  });

  // Totals
  const totals = rows.reduce((acc, r) => ({
    spend: acc.spend + r.totalSpend,
    dep: acc.dep + r.totalDep,
    reg: acc.reg + r.totalReg,
    ggr: acc.ggr + (r.ggr || 0),
    bonus: acc.bonus + (r.bonus || 0),
    ngr: acc.ngr + (r.ngr || 0),
    activePl: acc.activePl + (r.activePl || 0),
    validTurnover: acc.validTurnover + (r.validTurnover || 0),
    totalWithdrawal: acc.totalWithdrawal + (r.totalWithdrawal || 0),
  }), { spend: 0, dep: 0, reg: 0, ggr: 0, bonus: 0, ngr: 0, activePl: 0, validTurnover: 0, totalWithdrawal: 0 });

  const totalEfficacy = totals.spend > 0 ? (totals.ngr / totals.spend) * 100 : null;

  // Lift summary up to header
  React.useEffect(() => {
    onSummaryChange({ spend: totals.spend, dep: totals.dep, ngr: totals.ngr, efficacyRate: totalEfficacy });
  }, [totals.spend, totals.dep, totals.ngr, totalEfficacy]);

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

  const siteColors = { WFL: 'bg-blue-100 text-blue-700', RLM: 'bg-purple-100 text-purple-700', COW: 'bg-teal-100 text-teal-700', T2B: 'bg-rose-100 text-rose-700' };

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
        <button
          onClick={() => onAddEntry(selectedStreamer, selectedSite)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <Plus size={15}/> Add Day
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <span className="text-lg font-bold text-slate-800 uppercase tracking-wide">{selectedStreamer}</span>
          <span className="text-sm text-slate-400 font-medium">: End of Day Performance</span>
          <div className="text-xs text-slate-400 ml-auto">{rows.length} day{rows.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-green-900 text-white text-xs uppercase tracking-wider">
                <th className="px-2 py-2 text-left font-semibold">Day</th>
                <th className="px-2 py-2 text-left font-semibold">Site</th>
                <th className="px-2 py-2 text-right font-semibold">Reg</th>
                <th className="px-2 py-2 text-right font-semibold">Active PL</th>
                <th className="px-2 py-2 text-right font-semibold">Valid Turnover</th>
                <th className="px-2 py-2 text-right font-semibold">Ad Spend</th>
                <th className="px-2 py-2 text-right font-semibold">Total Deposit</th>
                <th className="px-2 py-2 text-right font-semibold">Withdrawal</th>
                <th className="px-2 py-2 text-right font-semibold">Win/Loss</th>
                <th className="px-2 py-2 text-right font-semibold">Bonus</th>
                <th className="px-2 py-2 text-right font-semibold">NGR</th>
                <th className="px-2 py-2 text-right font-semibold">Efficacy %</th>
                <th className="px-2 py-2 text-center font-semibold">Status</th>
                <th className="px-2 py-2 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={14} className="px-4 py-10 text-center text-slate-400 text-sm">
                    No data for <strong>{selectedStreamer}</strong> in the selected date range.
                  </td>
                </tr>
              )}
              {rows.map((row, idx) => (
                <React.Fragment key={idx}>
                  <tr className={`hover:bg-green-50/40 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                    <td className="px-2 py-2 font-medium text-slate-700 whitespace-nowrap">{fmtDate(row.date)}</td>
                    <td className="px-2 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${siteColors[row.siteName] || 'bg-gray-100 text-gray-600'}`}>{row.siteName}</span>
                    </td>
                    <td className="px-2 py-2 text-right text-slate-600">{row.totalReg}</td>
                    <td className="px-2 py-2 text-right text-slate-600">{row.activePl ? row.activePl.toLocaleString() : <span className="text-slate-300">—</span>}</td>
                    <td className="px-2 py-2 text-right text-slate-600">{row.validTurnover ? row.validTurnover.toLocaleString() : <span className="text-slate-300">—</span>}</td>
                    <td className="px-2 py-2 text-right text-red-500 font-medium">{formatPHP(row.totalSpend)}</td>
                    <td className="px-2 py-2 text-right text-emerald-600 font-medium">{formatPHP(row.totalDep)}</td>
                    <td className="px-2 py-2 text-right text-red-400">{row.totalWithdrawal ? `-${row.totalWithdrawal.toLocaleString()}` : <span className="text-slate-300">—</span>}</td>
                    <td className={`px-2 py-2 text-right ${(row.ggr || 0) >= 0 ? 'text-slate-600' : 'text-red-500'}`}>{fmtVal(row.ggr)}</td>
                    <td className="px-2 py-2 text-right text-amber-600">{fmtVal(row.bonus)}</td>
                    <td className={`px-2 py-2 text-right ${(row.ngr || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtVal(row.ngr)}</td>
                    <td className={`px-2 py-2 text-right ${efficacyColor(row.efficacyRate)}`}>
                      {row.efficacyRate !== null ? `${row.efficacyRate.toFixed(2)}%` : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {idx === rows.length - 1
                        ? <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">PENDING</span>
                        : <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">SUCCESS</span>}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                      {/* Edit GGR/Bonus/NGR */}
                      <button
                        onClick={() => onEdit(row.date, selectedStreamer, row.siteName)}
                        className="p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit GGR / Bonus / NGR"
                      >
                        <Edit2 size={12}/>
                      </button>
                      {/* Delete all entries for this day */}
                      <button
                        onClick={() => onDeleteDay(row.dayEntries)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete all entries for this day"
                      >
                        <Trash2 size={12}/>
                      </button>
                      </div>
                    </td>
                  </tr>
                  {/* Inline entries sub-row */}
                  {expandedRow === row.date && (
                    <tr className="bg-indigo-50/60">
                      <td colSpan={14} className="px-6 py-3">
                        <div className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-2">Campaign Entries — {fmtDate(row.date)}</div>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-slate-500 border-b border-indigo-100">
                              <th className="py-1 text-left font-semibold">Type</th>
                              <th className="py-1 text-right font-semibold">Spend</th>
                              <th className="py-1 text-right font-semibold">Reg</th>
                              <th className="py-1 text-right font-semibold">Deposit</th>
                              <th className="py-1 text-center font-semibold w-16"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {row.dayEntries.map((entry, ei) => (
                              <tr key={ei} className="border-b border-indigo-50 last:border-0">
                                <td className="py-1.5 text-slate-600">{entry.type}</td>
                                <td className="py-1.5 text-right text-red-500">{formatPHP(entry.spend)}</td>
                                <td className="py-1.5 text-right text-slate-600">{entry.reg}</td>
                                <td className="py-1.5 text-right text-emerald-600">{formatPHP(entry.dep)}</td>
                                <td className="py-1.5 text-center flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => onEditEntry(entry)}
                                    className="p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
                                    title="Edit entry"
                                  >
                                    <Edit2 size={11}/>
                                  </button>
                                  <button
                                    onClick={() => onDeleteEntry(entry)}
                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete entry"
                                  >
                                    <Trash2 size={11}/>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <button
                          onClick={() => onAddEntry(selectedStreamer, row.siteName)}
                          className="mt-2 flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-semibold transition-colors"
                        >
                          <Plus size={11}/> Add entry for this day
                        </button>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="bg-green-900 text-white font-bold text-sm">
                  <td className="px-2 py-2 uppercase tracking-wider" colSpan={2}>{selectedStreamer} Total</td>
                  <td className="px-2 py-2 text-right">{totals.reg}</td>
                  <td className="px-2 py-2 text-right">{totals.activePl ? totals.activePl.toLocaleString() : '—'}</td>
                  <td className="px-2 py-2 text-right">{totals.validTurnover ? totals.validTurnover.toLocaleString() : '—'}</td>
                  <td className="px-2 py-2 text-right">{formatPHP(totals.spend)}</td>
                  <td className="px-2 py-2 text-right">{formatPHP(totals.dep)}</td>
                  <td className="px-2 py-2 text-right opacity-80">{totals.totalWithdrawal ? `-${totals.totalWithdrawal.toLocaleString()}` : '—'}</td>
                  <td className={`px-2 py-2 text-right ${totals.ggr >= 0 ? '' : 'text-red-300'}`}>{fmtVal(totals.ggr)}</td>
                  <td className="px-2 py-2 text-right opacity-80">{fmtVal(totals.bonus)}</td>
                  <td className={`px-2 py-2 text-right ${totals.ngr >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{fmtVal(totals.ngr)}</td>
                  <td className={`px-2 py-2 text-right ${totalEfficacy !== null && totalEfficacy >= 100 ? 'text-emerald-300' : totalEfficacy !== null ? 'text-amber-300' : ''}`}>
                    {totalEfficacy !== null ? `${totalEfficacy.toFixed(2)}%` : '—'}
                  </td>
                  <td></td>
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