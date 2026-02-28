import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Users, Calendar, Filter, Video, Radio, ExternalLink, Plus, Trash2, Edit2, X, BarChart2, Activity, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
// Firebase removed — localStorage only mode.

// --- DATA SOURCE ---
const rawData = [
  {"date":"2026-01-23","site":"WFL","streamer":"HolyFather","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/watch/live/?ref=watch_permalink&v=885683144393946"},
  {"date":"2026-01-23","site":"WFL","streamer":"HolyFather","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/watch/live/?ref=watch_permalink&v=1230456252366739&rdid=PcAgDQaB6eOavtlR"},
  {"date":"2026-01-23","site":"WFL","streamer":"HolyFather","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/100084497334397/videos/1222680836504331/?rdid=pEQm12JfQxwZiGmK#"},
  {"date":"2026-01-23","site":"WFL","streamer":"Jason","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/itsmeJ4soon/videos/2024003294810360"},
  {"date":"2026-01-24","site":"WFL","streamer":"WoolFyBets","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/TeamAetherEsports/videos/1211344391104087"},
  {"date":"2026-01-24","site":"WFL","streamer":"WoolFyBets","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/865761549646384"},
  {"date":"2026-01-24","site":"WFL","streamer":"Jason","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1441004237542434"},
  {"date":"2026-01-25","site":"WFL","streamer":"Jason","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/itsmeJ4soon/videos/883670777385663"},
  {"date":"2026-01-25","site":"WFL","streamer":"HolyFather","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/100084497334397/videos/1212566064332187"},
  {"date":"2026-01-26","site":"WFL","streamer":"HolyFather","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/100084497334397/videos/4171745289806749"},
  {"date":"2026-01-26","site":"WFL","streamer":"Jason","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/1DEdoCao4m/"},
  {"date":"2026-01-26","site":"WFL","streamer":"Neggy","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/NeggyTvOfficial/videos/1609190960365176"},
  {"date":"2026-01-26","site":"WFL","streamer":"HolyFather","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/100084497334397/videos/3451812401636580"},
  {"date":"2026-01-26","site":"WFL","streamer":"HolyFather","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/100084497334397/videos/745052444909829"},
  {"date":"2026-01-26","site":"WFL","streamer":"WoolFyBets","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1802538730407024"},
  {"date":"2026-01-26","site":"WFL","streamer":"Jason","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/2078904466207308"},
  {"date":"2026-01-27","site":"WFL","streamer":"WoolFyBets","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1219664546299780"},
  {"date":"2026-01-27","site":"WFL","streamer":"HolyFather","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/100084497334397/videos/1400238677786680"},
  {"date":"2026-01-27","site":"WFL","streamer":"Neggy","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/NeggyTvOfficial/videos/1425117232563464"},
  {"date":"2026-01-27","site":"WFL","streamer":"Jason","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/itsmeJ4soon/videos/4392172377683040"},
  {"date":"2026-01-27","site":"WFL","streamer":"Jason","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1417740453129754"},
  {"date":"2026-01-28","site":"WFL","streamer":"Jason","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/771092899357472"},
  {"date":"2026-01-28","site":"WFL","streamer":"Neggy","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/NeggyTvOfficial/videos/1225303756228268"},
  {"date":"2026-01-28","site":"WFL","streamer":"WoolFyBets","spend":0,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1194027289558201"},
  {"date":"2026-01-28","site":"WFL","streamer":"HolyFather","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1703181710645180"},
  {"date":"2026-01-28","site":"WFL","streamer":"HolyFather","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/736212492579761"},
  {"date":"2026-01-29","site":"WFL","streamer":"HolyFather","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/100084497334397/videos/1413162906941210"},
  {"date":"2026-01-29","site":"WFL","streamer":"Neggy","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/NeggyTvOfficial/videos/3294398284067818"},
  {"date":"2026-01-29","site":"WFL","streamer":"Neggy","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1377157194447705"},
  {"date":"2026-01-29","site":"WFL","streamer":"Wrecker","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/bosswrecker/videos/910286828186637"},
  {"date":"2026-01-30","site":"WFL","streamer":"ATO","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/AtoClassSWorldwide/videos/2107283950029419"},
  {"date":"2026-01-30","site":"WFL","streamer":"Jason","spend":0,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/itsmeJ4soon/videos/922726767372793"},
  {"date":"2026-01-30","site":"WFL","streamer":"HolyFather","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/100084497334397/videos/2086982632036110"},
  {"date":"2026-01-31","site":"WFL","streamer":"HolyFather","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/100084497334397/videos/888757614052533"},
  {"date":"2026-01-31","site":"WFL","streamer":"Jason","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/itsmeJ4soon/videos/1505662780497529"},
  {"date":"2026-02-01","site":"WFL","streamer":"Neggy","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/NeggyTvOfficial/videos/1258035249540221"},
  {"date":"2026-02-01","site":"WFL","streamer":"WoolFyBets","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1482004456832877"},
  {"date":"2026-02-01","site":"WFL","streamer":"Jason","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/857112140650785"},
  {"date":"2026-02-01","site":"WFL","streamer":"ATO","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/AtoClassSWorldwide/videos/1471895327613814"},
  {"date":"2026-02-01","site":"WFL","streamer":"Jason","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/itsmeJ4soon/videos/1227233478814729"},
  {"date":"2026-02-02","site":"WFL","streamer":"WoolFyBets","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/TeamAetherEsports/videos/1468143128649664"},
  {"date":"2026-02-02","site":"WFL","streamer":"Neggy","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/NeggyTvOfficial/videos/2539091036487165"},
  {"date":"2026-02-03","site":"WFL","streamer":"Neggy","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/NeggyTvOfficial/videos/25551401257836303"},
  {"date":"2026-02-03","site":"WFL","streamer":"Neggy","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/2138138830280360"},
  {"date":"2026-02-03","site":"WFL","streamer":"Jason","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/itsmeJ4soon/videos/2126375441532235"},
  {"date":"2026-02-03","site":"WFL","streamer":"Jason","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/3880295828769349"},
  {"date":"2026-02-05","site":"WFL","streamer":"WoolFyBets","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/946763107678686"},
  {"date":"2026-02-05","site":"WFL","streamer":"Neggy","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/NeggyTvOfficial/videos/1204921241628901"},
  {"date":"2026-02-05","site":"WFL","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/1HBeTE2hQY/?mibextid=wwXIfr"},
  {"date":"2026-02-05","site":"WFL","streamer":"Wrecker","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/bosswrecker/videos/933610792682774"},
  {"date":"2026-02-05","site":"WFL","streamer":"Jason","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/100064343610389/videos/1590735218912899"},
  {"date":"2026-02-06","site":"WFL","streamer":"ATO","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1977286146503441"},
  {"date":"2026-02-06","site":"WFL","streamer":"Jason","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/2413183732437811"},
  {"date":"2026-02-06","site":"WFL","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/1BGKpevMck/?mibextid=wwXIfr"},
  {"date":"2026-02-07","site":"WFL","streamer":"Neggy","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/NeggyTvOfficial/videos/2123963611475339"},
  {"date":"2026-02-07","site":"WFL","streamer":"WoolFyBets","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/TeamAetherEsports/videos/1635276764148610"},
  {"date":"2026-02-07","site":"WFL","streamer":"WoolFyBets","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1989255735306528"},
  {"date":"2026-02-07","site":"WFL","streamer":"Wrecker","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/bosswrecker/videos/2050025072453651"},
  {"date":"2026-02-08","site":"WFL","streamer":"WoolFyBets","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/937831962018202"},
  {"date":"2026-02-08","site":"WFL","streamer":"Wrecker","spend":10000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/bosswrecker/videos/1206776438268781"},
  {"date":"2026-02-09","site":"WFL","streamer":"Neggy","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/NeggyTvOfficial/videos/1457249989083330/"},
  {"date":"2026-02-09","site":"WFL","streamer":"Wrecker","spend":10000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/61571307990071/videos/933228102375994"},
  {"date":"2026-02-10","site":"WFL","streamer":"Neggy","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/NeggyTvOfficial/videos/903855852253730"},
  {"date":"2026-02-11","site":"WFL","streamer":"Jason","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/itsmeJ4soon/videos/750412531124301"},
  {"date":"2026-02-12","site":"WFL","streamer":"Jason","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1998982444327708"},
  {"date":"2026-02-12","site":"WFL","streamer":"Neggy","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/NeggyTvOfficial/videos/1429035578823633"},
  {"date":"2026-02-13","site":"WFL","streamer":"Neggy","spend":2000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/NeggyTvOfficial/videos/1589967252206600/"},
  {"date":"2026-02-13","site":"WFL","streamer":"Wrecker","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/bosswrecker/videos/907038708540027"},
  {"date":"2026-02-14","site":"WFL","streamer":"Wrecker","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/bosswrecker/videos/1132890362176294/"},
  {"date":"2026-02-15","site":"WFL","streamer":"Neggy","spend":2000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/NeggyTvOfficial/videos/890227746946813"},
  {"date":"2026-02-15","site":"WFL","streamer":"Wrecker","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/bosswrecker/videos/2049746839286698"},
  {"date":"2026-02-16","site":"WFL","streamer":"Neggy","spend":2000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/NeggyTvOfficial/videos/766124036116835/"},
  {"date":"2026-02-16","site":"WFL","streamer":"Wrecker","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/bosswrecker/videos/25851082161208841"},
  {"date":"2026-02-17","site":"WFL","streamer":"HolyFather","spend":0,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/100084497334397/videos/1847515289984612"},
  {"date":"2026-02-17","site":"WFL","streamer":"HolyFather","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1330995745434333"},
  {"date":"2026-02-17","site":"WFL","streamer":"HolyFather","spend":2000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/100084497334397/videos/1493202355759004"},
  {"date":"2026-02-17","site":"WFL","streamer":"Neggy","spend":2000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/NeggyTvOfficial/videos/1573657753854289"},
  {"date":"2026-02-17","site":"WFL","streamer":"Jason","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/itsmeJ4soon/videos/1609581016712190"},
  {"date":"2026-02-17","site":"WFL","streamer":"HolyFather","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/100084497334397/videos/2284671212054231"},
  {"date":"2026-02-19","site":"WFL","streamer":"Jason","spend":15000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/itsmeJ4soon/videos/2053062885269958"},
  {"date":"2026-02-19","site":"WFL","streamer":"Jason","spend":0,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/842299848816687"},
  {"date":"2026-02-19","site":"WFL","streamer":"HolyFather","spend":15000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/100084497334397/videos/896441093189490"},
  {"date":"2026-02-19","site":"WFL","streamer":"WoolFyBets","spend":6000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/TeamAetherEsports/videos/1441190814221807"},
  {"date":"2026-02-19","site":"WFL","streamer":"Neggy","spend":5000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/NeggyTvOfficial/videos/25969226452749054/"},
  {"date":"2026-02-19","site":"WFL","streamer":"Wrecker","spend":35000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/bosswrecker/videos/1637630127255481"},
  {"date":"2026-02-20","site":"WFL","streamer":"HolyFather","spend":0,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/100084497334397/videos/940907548408173/"},
  {"date":"2026-02-20","site":"WFL","streamer":"Jason","spend":0,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1748049056170928"},
  {"date":"2026-02-20","site":"WFL","streamer":"WoolFyBets","spend":4000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/905983858816095"},
  {"date":"2026-02-20","site":"WFL","streamer":"Neggy","spend":0,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/NeggyTvOfficial/videos/1335162685040587/"},
  {"date":"2026-02-21","site":"WFL","streamer":"WoolFyBets","spend":0,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/TeamAetherEsports/videos/1469894714791070"},
  {"date":"2026-02-22","site":"WFL","streamer":"Jason","spend":0,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/itsmeJ4soon/videos/1084042223886702"},
  {"date":"2026-02-22","site":"WFL","streamer":"HolyFather","spend":15000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/100084497334397/videos/3614493192027161"},
  {"date":"2026-02-22","site":"WFL","streamer":"Wrecker","spend":0,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/61571307990071/videos/2902481506623071"},
  {"date":"2026-01-23","site":"RLM","streamer":"Pepper","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1174627438196210"},
  {"date":"2026-01-23","site":"RLM","streamer":"Pepper","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1331888308695207"},
  {"date":"2026-01-23","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/AprilJoyBarrueso/videos/719770387658466/?rdid=dkxVEvLqxvo9BAxp##"},
  {"date":"2026-01-23","site":"RLM","streamer":"Yuji","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/MageDadOfficial/videos/2083950799106728/?mibextid=wwXIfr&rdid=yzlq6DNNHIVcBTbe"},
  {"date":"2026-01-23","site":"RLM","streamer":"Pepper","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/AkoSiPepVT/videos/2286907945120179"},
  {"date":"2026-01-24","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/14b5g3dSrZp/"},
  {"date":"2026-01-25","site":"RLM","streamer":"Jape","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/1B1NfQncE7/?mibextid=wwXIfr"},
  {"date":"2026-01-25","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/181MuhvgaQ/"},
  {"date":"2026-01-25","site":"RLM","streamer":"Yuji","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/2631426843894671"},
  {"date":"2026-01-25","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/1G819NgCL8/"},
  {"date":"2026-01-25","site":"RLM","streamer":"Pepper","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/AkoSiPepVT/videos/849424834749801"},
  {"date":"2026-01-25","site":"RLM","streamer":"Yuji","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/1DZBS1M6HW/?mibextid=wwXIfr"},
  {"date":"2026-01-26","site":"RLM","streamer":"Pepper","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1985142072031770"},
  {"date":"2026-01-26","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/1BgHY3ufLH/"},
  {"date":"2026-01-26","site":"RLM","streamer":"Yuji","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/1Ae3nknz7f/?mibextid=wwXIfr"},
  {"date":"2026-01-27","site":"RLM","streamer":"Jape","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/18NMwBW7as/?mibextid=wwXIfr"},
  {"date":"2026-01-27","site":"RLM","streamer":"Yuji","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/16eWLnWbS9/?mibextid=wwXIfr"},
  {"date":"2026-01-28","site":"RLM","streamer":"Sainty","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1219902220267808/?s=single_unit"},
  {"date":"2026-01-28","site":"RLM","streamer":"Jape","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/883219898005132"},
  {"date":"2026-01-28","site":"RLM","streamer":"Sainty","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/3355479341301592"},
  {"date":"2026-01-28","site":"RLM","streamer":"Yuji","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/MageDadOfficial/videos/1309297821004636"},
  {"date":"2026-01-28","site":"RLM","streamer":"Pepper","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/AkoSiPepVT/videos/2435182743581156"},
  {"date":"2026-01-28","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/1KpAp2yk28/"},
  {"date":"2026-01-29","site":"RLM","streamer":"Jape","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/japealdeaofficial/videos/3818862108406986/"},
  {"date":"2026-01-30","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/4264556677204932"},
  {"date":"2026-01-30","site":"RLM","streamer":"Jape","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1596936341506127"},
  {"date":"2026-01-30","site":"RLM","streamer":"Jape","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/japealdeaofficial/videos/25529976833349181"},
  {"date":"2026-01-31","site":"RLM","streamer":"Sainty","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/v/1EyVup21nd/?mibextid=wwXIfr"},
  {"date":"2026-01-31","site":"RLM","streamer":"Pepper","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/AkoSiPepVT/videos/1216979156758075"},
  {"date":"2026-01-31","site":"RLM","streamer":"Jape","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/1Wve324hmi/?mibextid=wwXIfr"},
  {"date":"2026-01-31","site":"RLM","streamer":"Sainty","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/v/1GfwVZsgVx/?mibextid=wwXIfr"},
  {"date":"2026-02-01","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/25710982311919077"},
  {"date":"2026-02-01","site":"RLM","streamer":"Yuji","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/1BjGUW9HSd/?mibextid=wwXIfr"},
  {"date":"2026-02-01","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/1Ja9JeWepW/"},
  {"date":"2026-02-01","site":"RLM","streamer":"Pepper","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/AkoSiPepVT/videos/763022573520001"},
  {"date":"2026-02-01","site":"RLM","streamer":"Sainty","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/1KGxFdAYwT/?mibextid=wwXIfrr"},
  {"date":"2026-02-01","site":"RLM","streamer":"Sainty","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/17E4XkVEN6/?mibextid=wwXIfr"},
  {"date":"2026-02-02","site":"RLM","streamer":"Jape","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/japealdeaofficial/videos/884310657906295"},
  {"date":"2026-02-02","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/1C5oLXwfsi/?mibextid=wwXIfr"},
  {"date":"2026-02-02","site":"RLM","streamer":"Yuji","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/189cipCUfz/"},
  {"date":"2026-02-02","site":"RLM","streamer":"Pepper","spend":3000,"reg":0,"dep":0,"type":"Live","link":"ttps://www.facebook.com/AkoSiPepVT/videos/1409000614250077"},
  {"date":"2026-02-03","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/3756562284637621"},
  {"date":"2026-02-03","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/1866GhecK5/"},
  {"date":"2026-02-03","site":"RLM","streamer":"Sainty","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/v/1BXRYRy7kD/?mibextid=wwXIfr"},
  {"date":"2026-02-03","site":"RLM","streamer":"Yuji","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/16sfEV4t6v/?mibextid=wwXIfrSainty"},
  {"date":"2026-02-03","site":"RLM","streamer":"Yuji","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/189R4q95p6/?mibextid=wwXIfr"},
  {"date":"2026-02-05","site":"RLM","streamer":"Sainty","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/1DcA6jRvQS/?mibextid=wwXIfr"},
  {"date":"2026-02-05","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/185VujxSna/"},
  {"date":"2026-02-05","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"ttps://www.facebook.com/share/r/1G5LdDUHkS/?mibextid=wwXIfr"},
  {"date":"2026-02-05","site":"RLM","streamer":"Yuji","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/v/1GNEySVXoM/?mibextid=wwXIfr"},
  {"date":"2026-02-06","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/1KL6QtBwsJ/"},
  {"date":"2026-02-06","site":"RLM","streamer":"Jape","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/1646503923447556"},
  {"date":"2026-02-06","site":"RLM","streamer":"Sainty","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/1AQQW6XH9Z/?mibextid=wwXIfr"},
  {"date":"2026-02-07","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/19484132694003188"},
  {"date":"2026-02-08","site":"RLM","streamer":"Sainty","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/v/1AtyRcTcFX/?mibextid=wwXIfr"},
  {"date":"2026-02-10","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/1Dmxta7BNq/?mibextid=wwXIfr"},
  {"date":"2026-02-10","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/16HzeHjkiu/?mibextid=wwXIfr"},
  {"date":"2026-02-11","site":"RLM","streamer":"Pepper","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/3023241701218899"},
  {"date":"2026-02-11","site":"RLM","streamer":"Sainty","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/1Gdkackrre/?mibextid=wwXIfr"},
  {"date":"2026-02-12","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/17mTtxHZqA/"},
  {"date":"2026-02-12","site":"RLM","streamer":"Jape","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/1AatUqjnA9/?mibextid=wwXIfr"},
  {"date":"2026-02-12","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/1SJdyXwFTk/?mibextid=wwXIfr"},
  {"date":"2026-02-12","site":"RLM","streamer":"Sainty","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/61575739010148/videos/908858785185458"},
  {"date":"2026-02-13","site":"RLM","streamer":"Sainty","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/14UFQ23H38e/?mibextid=wwXIfr"},
  {"date":"2026-02-13","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/17xY2ajMy3/"},
  {"date":"2026-02-14","site":"RLM","streamer":"Jape","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/r/1bKKbsnjzD/?mibextid=wwXIfr"},
  {"date":"2026-02-15","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/1KCkHTy2w9/?mibextid=wwXIfr"},
  {"date":"2026-02-16","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/1CCb57zdFq/"},
  {"date":"2026-02-16","site":"RLM","streamer":"AJ","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/1Fu2Aab9dy/?mibextid=wwXIfr"},
  {"date":"2026-02-19","site":"RLM","streamer":"Sainty","spend":3000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/v/1FQNn8TtaV/?mibextid=wwXIfr"},
  {"date":"2026-02-19","site":"RLM","streamer":"Pepper","spend":9000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/AkoSiPepVT/videos/1214152930875048"},
  {"date":"2026-02-19","site":"RLM","streamer":"Sainty","spend":4000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/v/1c9eFsuCQQ/?mibextid=wwXIfr"},
  {"date":"2026-02-20","site":"RLM","streamer":"AJ","spend":18000,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/1Dz8A6Vmx4/"},
  {"date":"2026-02-20","site":"RLM","streamer":"AJ","spend":12000,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/1A7SfntoYA/?mibextid=wwXIfr"},
  {"date":"2026-02-21","site":"RLM","streamer":"Sainty","spend":0,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/188cpCWQWn/?mibextid=wwXIf"},
  {"date":"2026-02-21","site":"RLM","streamer":"AJ","spend":0,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/r/1ESdCyFXCX/?mibextid=wwXIfr"},
  {"date":"2026-02-22","site":"RLM","streamer":"Sainty","spend":0,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/v/1Evmg9Rxvt/?mibextid=wwXIfr"},
  {"date":"2026-02-23","site":"RLM","streamer":"AJ","spend":0,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/14TDMLqg18j/"},
  {"date":"2026-02-24","site":"RLM","streamer":"AJ","spend":0,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/764763246691386"},
  {"date":"2026-02-24","site":"RLM","streamer":"AJ","spend":0,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/reel/25990248340642557"},
  {"date":"2026-02-24","site":"RLM","streamer":"Sainty","spend":0,"reg":0,"dep":0,"type":"Reels","link":"https://www.facebook.com/share/v/16PEbZEbVw/?mibextid=wwXIfr"},
  {"date":"2026-02-25","site":"RLM","streamer":"AJ","spend":0,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/18KghvAV8L/"},
  {"date":"2026-02-25","site":"RLM","streamer":"AJ","spend":0,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/1CE21gSx8S/"},
  {"date":"2026-02-26","site":"RLM","streamer":"AJ","spend":0,"reg":0,"dep":0,"type":"Live","link":"https://www.facebook.com/share/v/1B3SJJ27so/"},
  {"date":"2026-02-26","site":"RLM","streamer":"Jape","spend":0,"reg":0,"dep":0,"type":"Reels","link":"https://web.facebook.com/share/v/1WqydA43VH/?mibextid=87OH41"}
];

// ─── BUILT-IN STREAMER ALIAS DICTIONARY ───────────────────────────────────
// Maps normalised CSV header/section names → canonical streamer display names.
// Works even when the app has zero existing data (no dependency on stored entries).
const STREAMER_ALIASES = {
  // ── WFL ──
  holyfather: 'HolyFather',          holyfatherreels: 'HolyFather',
  holyfatherpage: 'HolyFather',      holyfatherlive: 'HolyFather',
  jasoon: 'Jason',                   jasonreels: 'Jason',
  jason: 'Jason',                    itsj4soon: 'Jason',
  itsmeJ4soon: 'Jason',
  neggytv: 'Neggy',                  neggy: 'Neggy',
  neggytvofficial: 'Neggy',          neggyreels: 'Neggy',
  aether: 'WoolFyBets',              woolfybets: 'WoolFyBets',
  woolfybetsad: 'WoolFyBets',            woolfybetsreels: 'WoolFyBets',
  teamaether: 'WoolFyBets',              teamaetherreels: 'WoolFyBets',
  ghostwrecker: 'Wrecker',      bosswrecker: 'Wrecker',
  wrecker: 'Wrecker',           wreckeread: 'Wrecker',
  ato: 'ATO',                        atoclasss: 'ATO',
  atoclassworldwide: 'ATO',          atoclasssworld: 'ATO',
  wflato: 'ATO',
  wflaffiliate: 'WFL Affiliate',     wflaffliates: 'WFL Affiliate',
  // ── RLM ──
  pepper: 'Pepper',                  akosipep: 'Pepper',
  akosipepvt: 'Pepper',              pep: 'Pepper',
  aj: 'AJ',                          apriljoy: 'AJ',
  apriljoybad: 'AJ',                 apriljoylive: 'AJ',
  wflajad: 'AJ',                     wflajreels: 'AJ',
  ajheib: 'AJ',
  yuji: 'Yuji',                      magedad: 'Yuji',
  magedadyuji: 'Yuji',               magedadyujii: 'Yuji',
  yujimagedad: 'Yuji',
  jape: 'Jape',                      japealdea: 'Jape',
  japealdealive: 'Jape',
  kim: 'Kim',                        kimsolis: 'Kim',
  sainty: 'Sainty',                  saintymaxwin: 'Sainty',
  saintymaxwinreels: 'Sainty',
  // ── T2B / COW ──
  time2bet: 'T2B Affiliate',
  cow: 'COW Affiliate',
};

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
  '2026-02-02|Wrecker|WFL': { ggr: 44262, bonus: 1357, ngr: 45619 },
  '2026-02-03|Wrecker|WFL': { ggr: 7623, bonus: 5591, ngr: 13214 },
  '2026-02-04|Wrecker|WFL': { ggr: -80152, bonus: 2314, ngr: -77838 },
  '2026-02-05|Wrecker|WFL': { ggr: 917, bonus: 1795, ngr: 2712 },
  '2026-02-06|Wrecker|WFL': { ggr: 55016, bonus: 409, ngr: 55425 },
  '2026-02-07|Wrecker|WFL': { ggr: -69263, bonus: 490, ngr: -68773 },
  '2026-02-08|Wrecker|WFL': { ggr: 17700, bonus: 990, ngr: 18690 },
  '2026-02-09|Wrecker|WFL': { ggr: -57939, bonus: 825, ngr: -57114 },
  '2026-02-10|Wrecker|WFL': { ggr: -23465, bonus: 200, ngr: -23265 },
  '2026-02-11|Wrecker|WFL': { ggr: 130314, bonus: 45, ngr: 130359 },
  '2026-02-12|Wrecker|WFL': { ggr: -267304, bonus: 50, ngr: -267254 },
  '2026-02-13|Wrecker|WFL': { ggr: -34239, bonus: 105, ngr: -34134 },
  '2026-02-14|Wrecker|WFL': { ggr: -59757, bonus: 261, ngr: -59496 },
  '2026-02-15|Wrecker|WFL': { ggr: -42177, bonus: 370, ngr: -41807 },
  '2026-02-16|Wrecker|WFL': { ggr: 476, bonus: 690, ngr: 1166 },
  '2026-02-17|Wrecker|WFL': { ggr: 42934, bonus: 1151, ngr: 44085 },
  '2026-02-18|Wrecker|WFL': { ggr: 17447, bonus: 1090, ngr: 18537 },
  '2026-02-19|Wrecker|WFL': { ggr: -86806, bonus: 357, ngr: -86449 },
  '2026-02-20|Wrecker|WFL': { ggr: 18209, bonus: 160, ngr: 18369 },
  '2026-02-21|Wrecker|WFL': { ggr: -48898, bonus: 367, ngr: -48531 },
  '2026-02-22|Wrecker|WFL': { ggr: -47018, bonus: 705, ngr: -46313 },
  '2026-02-23|Wrecker|WFL': { ggr: -14287, bonus: 484, ngr: -13803 },
  '2026-02-24|Wrecker|WFL': { ggr: 2276, bonus: 305, ngr: 2581 },
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
  '2026-02-02|WoolFyBets|WFL': { ggr: 2307, bonus: 1120, ngr: 3427 },
  '2026-02-03|WoolFyBets|WFL': { ggr: -18251, bonus: 448, ngr: -17803 },
  '2026-02-04|WoolFyBets|WFL': { ggr: -240, bonus: 230, ngr: -10 },
  '2026-02-05|WoolFyBets|WFL': { ggr: -684, bonus: 228, ngr: -455 },
  '2026-02-06|WoolFyBets|WFL': { ggr: -1900, bonus: 60, ngr: -1840 },
  '2026-02-07|WoolFyBets|WFL': { ggr: -379, bonus: 570, ngr: 191 },
  '2026-02-08|WoolFyBets|WFL': { ggr: -2480, bonus: 30, ngr: -2450 },
  '2026-02-09|WoolFyBets|WFL': { ggr: -3356, bonus: 0, ngr: -3356 },
  '2026-02-10|WoolFyBets|WFL': { ggr: -332, bonus: 0, ngr: -332 },
  '2026-02-11|WoolFyBets|WFL': { ggr: 7287, bonus: 0, ngr: 7287 },
  '2026-02-12|WoolFyBets|WFL': { ggr: 2331, bonus: 50, ngr: 2381 },
  '2026-02-13|WoolFyBets|WFL': { ggr: -155, bonus: 30, ngr: -125 },
  '2026-02-14|WoolFyBets|WFL': { ggr: 2938, bonus: 0, ngr: 2938 },
  '2026-02-15|WoolFyBets|WFL': { ggr: -90392, bonus: 50, ngr: -90342 },
  '2026-02-16|WoolFyBets|WFL': { ggr: -4977, bonus: 0, ngr: -4977 },
  '2026-02-17|WoolFyBets|WFL': { ggr: -1500, bonus: 0, ngr: -1500 },
  '2026-02-18|WoolFyBets|WFL': { ggr: 5295, bonus: 0, ngr: 5295 },
  '2026-02-19|WoolFyBets|WFL': { ggr: 982, bonus: 1030, ngr: 2012 },
  '2026-02-20|WoolFyBets|WFL': { ggr: 3709, bonus: 30, ngr: 3739 },
  '2026-02-21|WoolFyBets|WFL': { ggr: 7888, bonus: 150, ngr: 8038 },
  '2026-02-22|WoolFyBets|WFL': { ggr: 4055, bonus: 1560, ngr: 5615 },
  '2026-02-23|WoolFyBets|WFL': { ggr: -23220, bonus: 0, ngr: -23220 },
  '2026-02-24|WoolFyBets|WFL': { ggr: -1718, bonus: 229, ngr: -1489 },
  // Dogie / T2B
  '2026-02-02|Dogie|T2B': { reg:1420, activePl:2357, validTurnover:18469643, ggr:-550146, bonus:123693, ngr:-426453, dep:2109490, totalWithdrawal:1635398 },
  '2026-02-03|Dogie|T2B': { reg:2002, activePl:2487, validTurnover:20638630, ggr:-366632, bonus:92482, ngr:-274151, dep:2413443, totalWithdrawal:1634098 },
  '2026-02-04|Dogie|T2B': { reg:2059, activePl:2848, validTurnover:20365294, ggr:-1000568, bonus:127943, ngr:-872625, dep:2553947, totalWithdrawal:1991570 },
  '2026-02-05|Dogie|T2B': { reg:1681, activePl:2692, validTurnover:23160833, ggr:-612702, bonus:142264, ngr:-470438, dep:2029034, totalWithdrawal:1768608 },
  '2026-02-06|Dogie|T2B': { reg:1109, activePl:2479, validTurnover:17843903, ggr:-576739, bonus:107737, ngr:-469003, dep:2200722, totalWithdrawal:1443654 },
  '2026-02-07|Dogie|T2B': { reg:916, activePl:2124, validTurnover:16789236, ggr:-790382, bonus:89863, ngr:-700519, dep:2006314, totalWithdrawal:1673675 },
  '2026-02-08|Dogie|T2B': { reg:1837, activePl:2448, validTurnover:15819968, ggr:-325466, bonus:105218, ngr:-220247, dep:1887784, totalWithdrawal:1667731 },
  '2026-02-09|Dogie|T2B': { reg:901, activePl:2139, validTurnover:18112552, ggr:-897609, bonus:87987, ngr:-809621, dep:2276827, totalWithdrawal:1525291 },
  '2026-02-10|Dogie|T2B': { reg:656, activePl:1946, validTurnover:14606824, ggr:-730996, bonus:82742, ngr:-648254, dep:1946819, totalWithdrawal:1142126 },
  '2026-02-11|Dogie|T2B': { reg:766, activePl:1924, validTurnover:19114100, ggr:-122777, bonus:72278, ngr:-50499, dep:1819590, totalWithdrawal:1541597 },
  '2026-02-12|Dogie|T2B': { reg:729, activePl:1774, validTurnover:19941619, ggr:-931643, bonus:77611, ngr:-854032, dep:1999877, totalWithdrawal:1477029 },
  '2026-02-13|Dogie|T2B': { reg:843, activePl:1931, validTurnover:16647708, ggr:-906118, bonus:93179, ngr:-812940, dep:1963838, totalWithdrawal:1166381 },
  '2026-02-14|Dogie|T2B': { reg:738, activePl:1905, validTurnover:13735442, ggr:-165319, bonus:72859, ngr:-92460, dep:1771982, totalWithdrawal:1574077 },
  '2026-02-15|Dogie|T2B': { reg:710, activePl:1904, validTurnover:15818275, ggr:-711414, bonus:83111, ngr:-628303, dep:1980180, totalWithdrawal:1285979 },
  '2026-02-16|Dogie|T2B': { reg:508, activePl:1707, validTurnover:15435091, ggr:-797924, bonus:77409, ngr:-720515, dep:1835063, totalWithdrawal:1165965 },
  '2026-02-17|Dogie|T2B': { reg:845, activePl:1709, validTurnover:15954667, ggr:-127029, bonus:114099, ngr:-12930, dep:1532923, totalWithdrawal:1408492 },
  '2026-02-18|Dogie|T2B': { reg:823, activePl:1661, validTurnover:15762902, ggr:-422870, bonus:95374, ngr:-327496, dep:1578565, totalWithdrawal:1318216 },
  '2026-02-19|Dogie|T2B': { reg:789, activePl:1805, validTurnover:12956695, ggr:-1056525, bonus:75895, ngr:-980630, dep:1830499, totalWithdrawal:1069412 },
  '2026-02-20|Dogie|T2B': { reg:1028, activePl:1886, validTurnover:11894001, ggr:-945467, bonus:93205, ngr:-852262, dep:1825567, totalWithdrawal:935470 },
  '2026-02-21|Dogie|T2B': { reg:715, activePl:1868, validTurnover:16032881, ggr:-460328, bonus:69675, ngr:-390653, dep:1928158, totalWithdrawal:1452304 },
  '2026-02-22|Dogie|T2B': { reg:651, activePl:1722, validTurnover:14254879, ggr:-707759, bonus:71426, ngr:-636333, dep:1673720, totalWithdrawal:1128762 },
  '2026-02-23|Dogie|T2B': { reg:622, activePl:1679, validTurnover:14845796, ggr:206704, bonus:68018, ngr:274722, dep:1692087, totalWithdrawal:1067195 },
  '2026-02-24|Dogie|T2B': { reg:553, activePl:1642, validTurnover:13202529, ggr:-498467, bonus:73828, ngr:-424638, dep:1343763, totalWithdrawal:1205273 },
  '2026-02-25|Dogie|T2B': { reg:740, activePl:1605, validTurnover:13414625, ggr:-333717, bonus:69595, ngr:-264123, dep:1389905, totalWithdrawal:1184014 },
  '2026-02-26|Dogie|T2B': { reg:1194, activePl:1822, validTurnover:13116424, ggr:-488737, bonus:69089, ngr:-419648, dep:1610823, totalWithdrawal:1498549 },
  // Renejay / T2B
  '2026-02-02|Renejay|T2B': { reg:4, activePl:57, validTurnover:515924, ggr:-44224, bonus:9795, ngr:-34429, dep:84422, totalWithdrawal:38920 },
  '2026-02-03|Renejay|T2B': { reg:3, activePl:54, validTurnover:440285, ggr:-41889, bonus:1077, ngr:-40811, dep:45811, totalWithdrawal:15145 },
  '2026-02-04|Renejay|T2B': { reg:9, activePl:63, validTurnover:247179, ggr:-15801, bonus:3292, ngr:-12509, dep:41490, totalWithdrawal:23330 },
  '2026-02-05|Renejay|T2B': { reg:0, activePl:57, validTurnover:297473, ggr:-16728, bonus:9506, ngr:-7223, dep:49748, totalWithdrawal:42949 },
  '2026-02-06|Renejay|T2B': { reg:439, activePl:109, validTurnover:373093, ggr:-33382, bonus:2594, ngr:-30788, dep:64444, totalWithdrawal:32851 },
  '2026-02-07|Renejay|T2B': { reg:569, activePl:216, validTurnover:730890, ggr:-65917, bonus:15501, ngr:-50415, dep:121526, totalWithdrawal:44781 },
  '2026-02-08|Renejay|T2B': { reg:284, activePl:217, validTurnover:771273, ggr:-44258, bonus:11885, ngr:-32373, dep:85866, totalWithdrawal:52227 },
  '2026-02-09|Renejay|T2B': { reg:228, activePl:179, validTurnover:452759, ggr:-37345, bonus:4087, ngr:-33257, dep:65230, totalWithdrawal:29466 },
  '2026-02-10|Renejay|T2B': { reg:1120, activePl:414, validTurnover:2476670, ggr:52849, bonus:37549, ngr:90398, dep:199758, totalWithdrawal:169883 },
  '2026-02-11|Renejay|T2B': { reg:648, activePl:413, validTurnover:2446962, ggr:-45446, bonus:17776, ngr:-27670, dep:262715, totalWithdrawal:243611 },
  '2026-02-12|Renejay|T2B': { reg:461, activePl:463, validTurnover:2457150, ggr:-113631, bonus:19098, ngr:-94532, dep:282354, totalWithdrawal:214167 },
  '2026-02-13|Renejay|T2B': { reg:348, activePl:426, validTurnover:2331335, ggr:-76027, bonus:22324, ngr:-53703, dep:270160, totalWithdrawal:236022 },
  '2026-02-14|Renejay|T2B': { reg:419, activePl:447, validTurnover:1898371, ggr:-145752, bonus:15482, ngr:-130271, dep:211797, totalWithdrawal:71743 },
  '2026-02-15|Renejay|T2B': { reg:681, activePl:554, validTurnover:2489842, ggr:185570, bonus:23654, ngr:209224, dep:348136, totalWithdrawal:436439 },
  '2026-02-16|Renejay|T2B': { reg:671, activePl:541, validTurnover:4029478, ggr:179055, bonus:30117, ngr:209173, dep:395735, totalWithdrawal:498200 },
  '2026-02-17|Renejay|T2B': { reg:513, activePl:565, validTurnover:5072558, ggr:-234851, bonus:36060, ngr:-198791, dep:440188, totalWithdrawal:436023 },
  '2026-02-18|Renejay|T2B': { reg:551, activePl:477, validTurnover:3081340, ggr:-277158, bonus:26412, ngr:-250745, dep:418698, totalWithdrawal:203713 },
  '2026-02-19|Renejay|T2B': { reg:444, activePl:472, validTurnover:2831668, ggr:-237017, bonus:21822, ngr:-215195, dep:401624, totalWithdrawal:227898 },
  '2026-02-20|Renejay|T2B': { reg:409, activePl:426, validTurnover:2558508, ggr:-22310, bonus:26458, ngr:4147, dep:317220, totalWithdrawal:237129 },
  '2026-02-21|Renejay|T2B': { reg:288, activePl:451, validTurnover:2875641, ggr:-159876, bonus:19712, ngr:-140164, dep:298831, totalWithdrawal:228188 },
  '2026-02-22|Renejay|T2B': { reg:199, activePl:342, validTurnover:2392901, ggr:-112590, bonus:16711, ngr:-95879, dep:282997, totalWithdrawal:148289 },
  '2026-02-23|Renejay|T2B': { reg:220, activePl:354, validTurnover:2147429, ggr:-135664, bonus:16315, ngr:-119350, dep:267400, totalWithdrawal:134903 },
  '2026-02-24|Renejay|T2B': { reg:211, activePl:359, validTurnover:2681876, ggr:-185289, bonus:12892, ngr:-172397, dep:298220, totalWithdrawal:125702 },
  '2026-02-25|Renejay|T2B': { reg:244, activePl:349, validTurnover:2560308, ggr:-20727, bonus:13154, ngr:-7573, dep:273743, totalWithdrawal:178187 },
  '2026-02-26|Renejay|T2B': { reg:364, activePl:435, validTurnover:3257002, ggr:-73670, bonus:24575, ngr:-49095, dep:412907, totalWithdrawal:401334 },
  // H2wo / T2B
  '2026-02-02|H2wo|T2B': { reg:524, activePl:278, validTurnover:1289446, ggr:44948, bonus:29676, ngr:74624, dep:152339, totalWithdrawal:175410 },
  '2026-02-03|H2wo|T2B': { reg:459, activePl:389, validTurnover:2478365, ggr:-204261, bonus:21528, ngr:-182733, dep:315916, totalWithdrawal:190784 },
  '2026-02-04|H2wo|T2B': { reg:295, activePl:289, validTurnover:1994814, ggr:-110160, bonus:16432, ngr:-93728, dep:246274, totalWithdrawal:159170 },
  '2026-02-05|H2wo|T2B': { reg:375, activePl:305, validTurnover:1449544, ggr:-50025, bonus:19002, ngr:-31023, dep:230540, totalWithdrawal:188299 },
  '2026-02-06|H2wo|T2B': { reg:167, activePl:303, validTurnover:2063818, ggr:-79503, bonus:14287, ngr:-65216, dep:260601, totalWithdrawal:214889 },
  '2026-02-07|H2wo|T2B': { reg:89, activePl:213, validTurnover:1458591, ggr:-64460, bonus:11030, ngr:-53429, dep:168016, totalWithdrawal:78209 },
  '2026-02-08|H2wo|T2B': { reg:233, activePl:233, validTurnover:2123549, ggr:2803, bonus:14292, ngr:17095, dep:238278, totalWithdrawal:170670 },
  '2026-02-09|H2wo|T2B': { reg:152, activePl:220, validTurnover:1906632, ggr:-171988, bonus:8736, ngr:-163252, dep:183873, totalWithdrawal:145507 },
  '2026-02-10|H2wo|T2B': { reg:139, activePl:210, validTurnover:1462902, ggr:-37111, bonus:27585, ngr:-9526, dep:152746, totalWithdrawal:130204 },
  '2026-02-11|H2wo|T2B': { reg:100, activePl:197, validTurnover:923189, ggr:-32742, bonus:11350, ngr:-21393, dep:133605, totalWithdrawal:93631 },
  '2026-02-12|H2wo|T2B': { reg:339, activePl:255, validTurnover:1446788, ggr:-135942, bonus:13928, ngr:-122014, dep:195826, totalWithdrawal:76115 },
  '2026-02-13|H2wo|T2B': { reg:187, activePl:251, validTurnover:1427691, ggr:-56184, bonus:10968, ngr:-45216, dep:205681, totalWithdrawal:171985 },
  '2026-02-14|H2wo|T2B': { reg:119, activePl:236, validTurnover:1426140, ggr:-32333, bonus:7293, ngr:-25041, dep:183822, totalWithdrawal:145430 },
  '2026-02-15|H2wo|T2B': { reg:237, activePl:291, validTurnover:1390186, ggr:-80404, bonus:12958, ngr:-67446, dep:232444, totalWithdrawal:183826 },
  '2026-02-16|H2wo|T2B': { reg:294, activePl:290, validTurnover:2849078, ggr:-30000, bonus:12950, ngr:-17050, dep:240216, totalWithdrawal:195304 },
  '2026-02-17|H2wo|T2B': { reg:496, activePl:319, validTurnover:1669170, ggr:-100150, bonus:12659, ngr:-87491, dep:208424, totalWithdrawal:140597 },
  '2026-02-18|H2wo|T2B': { reg:257, activePl:310, validTurnover:1405881, ggr:-71568, bonus:11565, ngr:-60002, dep:203028, totalWithdrawal:148273 },
  '2026-02-19|H2wo|T2B': { reg:200, activePl:273, validTurnover:1213978, ggr:-33710, bonus:18410, ngr:-15300, dep:180591, totalWithdrawal:175981 },
  '2026-02-20|H2wo|T2B': { reg:210, activePl:265, validTurnover:1700428, ggr:-117411, bonus:27356, ngr:-90055, dep:241459, totalWithdrawal:118384 },
  '2026-02-21|H2wo|T2B': { reg:639, activePl:404, validTurnover:1813728, ggr:-148779, bonus:23643, ngr:-125136, dep:247740, totalWithdrawal:112337 },
  '2026-02-22|H2wo|T2B': { reg:319, activePl:377, validTurnover:1738403, ggr:-66368, bonus:15050, ngr:-51318, dep:196667, totalWithdrawal:177576 },
  '2026-02-23|H2wo|T2B': { reg:458, activePl:363, validTurnover:1622387, ggr:-100459, bonus:9500, ngr:-90959, dep:273695, totalWithdrawal:198968 },
  '2026-02-24|H2wo|T2B': { reg:477, activePl:402, validTurnover:1584997, ggr:33513, bonus:20333, ngr:53847, dep:212019, totalWithdrawal:197736 },
  '2026-02-25|H2wo|T2B': { reg:893, activePl:601, validTurnover:2739497, ggr:-212002, bonus:39154, ngr:-172848, dep:335346, totalWithdrawal:257135 },
  '2026-02-26|H2wo|T2B': { reg:513, activePl:513, validTurnover:2798662, ggr:-104012, bonus:25555, ngr:-78458, dep:315811, totalWithdrawal:239243 },
  // Yawi / T2B
  '2026-02-02|Yawi|T2B': { reg:208, activePl:268, validTurnover:963725, ggr:-15016, bonus:26648, ngr:11632, dep:110523, totalWithdrawal:104406 },
  '2026-02-03|Yawi|T2B': { reg:109, activePl:220, validTurnover:1134814, ggr:-90883, bonus:7518, ngr:-83365, dep:110444, totalWithdrawal:61914 },
  '2026-02-04|Yawi|T2B': { reg:111, activePl:194, validTurnover:612928, ggr:-14806, bonus:5419, ngr:-9387, dep:98599, totalWithdrawal:74603 },
  '2026-02-05|Yawi|T2B': { reg:200, activePl:206, validTurnover:881090, ggr:-53731, bonus:6583, ngr:-47148, dep:125840, totalWithdrawal:81165 },
  '2026-02-06|Yawi|T2B': { reg:214, activePl:231, validTurnover:1468595, ggr:-77302, bonus:6972, ngr:-70330, dep:182908, totalWithdrawal:88100 },
  '2026-02-07|Yawi|T2B': { reg:256, activePl:252, validTurnover:1376469, ggr:-49805, bonus:7955, ngr:-41850, dep:171529, totalWithdrawal:142149 },
  '2026-02-08|Yawi|T2B': { reg:173, activePl:227, validTurnover:1289273, ggr:-78772, bonus:4562, ngr:-74210, dep:209711, totalWithdrawal:128546 },
  '2026-02-09|Yawi|T2B': { reg:74, activePl:171, validTurnover:1006057, ggr:-83798, bonus:6242, ngr:-77556, dep:139874, totalWithdrawal:93754 },
  '2026-02-10|Yawi|T2B': { reg:100, activePl:179, validTurnover:928695, ggr:-36607, bonus:8362, ngr:-28244, dep:116358, totalWithdrawal:96720 },
  '2026-02-11|Yawi|T2B': { reg:88, activePl:164, validTurnover:639081, ggr:-47586, bonus:5510, ngr:-42076, dep:90968, totalWithdrawal:46978 },
  '2026-02-12|Yawi|T2B': { reg:277, activePl:212, validTurnover:849618, ggr:10515, bonus:7441, ngr:17956, dep:106435, totalWithdrawal:118721 },
  '2026-02-13|Yawi|T2B': { reg:88, activePl:181, validTurnover:1985950, ggr:-78059, bonus:7789, ngr:-70270, dep:126199, totalWithdrawal:87208 },
  '2026-02-14|Yawi|T2B': { reg:145, activePl:172, validTurnover:1000394, ggr:-47497, bonus:7098, ngr:-40399, dep:167128, totalWithdrawal:107805 },
  '2026-02-15|Yawi|T2B': { reg:260, activePl:235, validTurnover:1247049, ggr:-112329, bonus:18835, ngr:-93495, dep:199787, totalWithdrawal:114467 },
  '2026-02-16|Yawi|T2B': { reg:124, activePl:209, validTurnover:1009675, ggr:-37889, bonus:6752, ngr:-31137, dep:153362, totalWithdrawal:84540 },
  '2026-02-17|Yawi|T2B': { reg:103, activePl:194, validTurnover:985352, ggr:-71595, bonus:6634, ngr:-64961, dep:94884, totalWithdrawal:66336 },
  '2026-02-18|Yawi|T2B': { reg:267, activePl:213, validTurnover:1028984, ggr:-65359, bonus:6751, ngr:-58608, dep:120259, totalWithdrawal:63737 },
  '2026-02-19|Yawi|T2B': { reg:108, activePl:196, validTurnover:1382019, ggr:27821, bonus:11415, ngr:39236, dep:147034, totalWithdrawal:178151 },
  '2026-02-20|Yawi|T2B': { reg:355, activePl:265, validTurnover:1435638, ggr:-21316, bonus:13434, ngr:-7882, dep:172421, totalWithdrawal:166208 },
  '2026-02-21|Yawi|T2B': { reg:252, activePl:248, validTurnover:1732335, ggr:279147, bonus:10739, ngr:289887, dep:156323, totalWithdrawal:150140 },
  '2026-02-22|Yawi|T2B': { reg:96, activePl:202, validTurnover:2573770, ggr:-395699, bonus:11724, ngr:-383975, dep:307467, totalWithdrawal:207298 },
  '2026-02-23|Yawi|T2B': { reg:259, activePl:249, validTurnover:1071441, ggr:-62409, bonus:9350, ngr:-53058, dep:151913, totalWithdrawal:81228 },
  '2026-02-24|Yawi|T2B': { reg:143, activePl:206, validTurnover:1138209, ggr:-21914, bonus:5774, ngr:-16140, dep:153270, totalWithdrawal:108375 },
  '2026-02-25|Yawi|T2B': { reg:87, activePl:175, validTurnover:895549, ggr:-39270, bonus:5291, ngr:-33979, dep:90754, totalWithdrawal:104795 },
  '2026-02-26|Yawi|T2B': { reg:73, activePl:176, validTurnover:1448192, ggr:16511, bonus:11831, ngr:28342, dep:159908, totalWithdrawal:164391 },
  // Zico / T2B
  '2026-02-02|Zico|T2B': { reg:44, activePl:19, validTurnover:27430, ggr:-424, bonus:8747, ngr:8323, dep:3915, totalWithdrawal:3750 },
  '2026-02-03|Zico|T2B': { reg:141, activePl:17, validTurnover:71600, ggr:-4691, bonus:1099, ngr:-3592, dep:5583, totalWithdrawal:9850 },
  '2026-02-04|Zico|T2B': { reg:99, activePl:24, validTurnover:25107, ggr:-5550, bonus:720, ngr:-4830, dep:5808, totalWithdrawal:1800 },
  '2026-02-05|Zico|T2B': { reg:51, activePl:19, validTurnover:114129, ggr:-28649, bonus:4990, ngr:-23659, dep:26755, totalWithdrawal:2100 },
  '2026-02-06|Zico|T2B': { reg:42, activePl:24, validTurnover:49709, ggr:-1782, bonus:893, ngr:-889, dep:6065, totalWithdrawal:0 },
  '2026-02-07|Zico|T2B': { reg:4, activePl:9, validTurnover:22661, ggr:-886, bonus:40, ngr:-846, dep:2470, totalWithdrawal:3320 },
  '2026-02-08|Zico|T2B': { reg:4, activePl:16, validTurnover:26931, ggr:-1840, bonus:140, ngr:-1700, dep:3761, totalWithdrawal:3200 },
  '2026-02-09|Zico|T2B': { reg:0, activePl:10, validTurnover:47270, ggr:-7493, bonus:0, ngr:-7493, dep:9335, totalWithdrawal:2720 },
  '2026-02-10|Zico|T2B': { reg:7, activePl:14, validTurnover:30550, ggr:1478, bonus:120, ngr:1598, dep:2341, totalWithdrawal:4000 },
  '2026-02-11|Zico|T2B': { reg:8, activePl:8, validTurnover:23882, ggr:11856, bonus:70, ngr:11926, dep:1649, totalWithdrawal:14500 },
  '2026-02-12|Zico|T2B': { reg:2, activePl:13, validTurnover:44092, ggr:-238, bonus:310, ngr:72, dep:3680, totalWithdrawal:2100 },
  '2026-02-13|Zico|T2B': { reg:43, activePl:12, validTurnover:21865, ggr:-1518, bonus:0, ngr:-1518, dep:2490, totalWithdrawal:2800 },
  '2026-02-14|Zico|T2B': { reg:4, activePl:12, validTurnover:76368, ggr:-2705, bonus:2040, ngr:-665, dep:5229, totalWithdrawal:1000 },
  '2026-02-15|Zico|T2B': { reg:6, activePl:13, validTurnover:146686, ggr:43040, bonus:696, ngr:43736, dep:8205, totalWithdrawal:51915 },
  '2026-02-16|Zico|T2B': { reg:25, activePl:22, validTurnover:359682, ggr:15424, bonus:4906, ngr:20329, dep:56034, totalWithdrawal:80400 },
  '2026-02-17|Zico|T2B': { reg:4, activePl:9, validTurnover:141027, ggr:-29193, bonus:9822, ngr:-19370, dep:20403, totalWithdrawal:407 },
  '2026-02-18|Zico|T2B': { reg:6, activePl:10, validTurnover:17597, ggr:-4097, bonus:71, ngr:-4026, dep:3790, totalWithdrawal:0 },
  '2026-02-19|Zico|T2B': { reg:8, activePl:11, validTurnover:11662, ggr:-1980, bonus:256, ngr:-1724, dep:2520, totalWithdrawal:1536 },
  '2026-02-20|Zico|T2B': { reg:8, activePl:9, validTurnover:9838, ggr:-2005, bonus:0, ngr:-2005, dep:2292, totalWithdrawal:0 },
  '2026-02-21|Zico|T2B': { reg:3, activePl:10, validTurnover:22237, ggr:-3054, bonus:125, ngr:-2929, dep:4040, totalWithdrawal:1500 },
  '2026-02-22|Zico|T2B': { reg:0, activePl:6, validTurnover:8583, ggr:-2820, bonus:320, ngr:-2500, dep:2500, totalWithdrawal:0 },
  '2026-02-23|Zico|T2B': { reg:19, activePl:10, validTurnover:57194, ggr:-7401, bonus:2550, ngr:-4851, dep:10675, totalWithdrawal:5500 },
  '2026-02-24|Zico|T2B': { reg:3, activePl:11, validTurnover:81073, ggr:-4914, bonus:85, ngr:-4829, dep:10820, totalWithdrawal:6700 },
  '2026-02-25|Zico|T2B': { reg:0, activePl:3, validTurnover:17142, ggr:2543, bonus:0, ngr:2543, dep:6190, totalWithdrawal:1033 },
  '2026-02-26|Zico|T2B': { reg:15, activePl:10, validTurnover:87749, ggr:-14379, bonus:2080, ngr:-12299, dep:13000, totalWithdrawal:9500 },
  // Jape / T2B
  '2026-02-02|Jape|T2B': { reg:122, activePl:41, validTurnover:256435, ggr:-21111, bonus:839, ngr:-20272, dep:32430, totalWithdrawal:15500 },
  '2026-02-03|Jape|T2B': { reg:116, activePl:61, validTurnover:119594, ggr:2612, bonus:1034, ngr:3645, dep:22407, totalWithdrawal:21418 },
  '2026-02-04|Jape|T2B': { reg:27, activePl:57, validTurnover:241159, ggr:621, bonus:1618, ngr:2238, dep:27883, totalWithdrawal:34015 },
  '2026-02-05|Jape|T2B': { reg:26, activePl:43, validTurnover:170535, ggr:-18245, bonus:1436, ngr:-16808, dep:29748, totalWithdrawal:7500 },
  '2026-02-06|Jape|T2B': { reg:19, activePl:44, validTurnover:249876, ggr:-18667, bonus:2378, ngr:-16289, dep:35977, totalWithdrawal:21100 },
  '2026-02-07|Jape|T2B': { reg:19, activePl:42, validTurnover:255706, ggr:912, bonus:1577, ngr:2489, dep:42789, totalWithdrawal:43425 },
  '2026-02-08|Jape|T2B': { reg:7, activePl:30, validTurnover:229846, ggr:-13758, bonus:809, ngr:-12949, dep:20756, totalWithdrawal:9170 },
  '2026-02-09|Jape|T2B': { reg:8, activePl:29, validTurnover:216953, ggr:50923, bonus:796, ngr:51719, dep:13015, totalWithdrawal:59400 },
  '2026-02-10|Jape|T2B': { reg:28, activePl:34, validTurnover:193770, ggr:9067, bonus:1147, ngr:10214, dep:20660, totalWithdrawal:37682 },
  '2026-02-11|Jape|T2B': { reg:24, activePl:40, validTurnover:340251, ggr:-29883, bonus:1333, ngr:-28549, dep:44349, totalWithdrawal:13478 },
  '2026-02-12|Jape|T2B': { reg:16, activePl:31, validTurnover:93076, ggr:-15266, bonus:861, ngr:-14405, dep:12876, totalWithdrawal:2100 },
  '2026-02-13|Jape|T2B': { reg:31, activePl:41, validTurnover:328223, ggr:-26200, bonus:989, ngr:-25211, dep:34433, totalWithdrawal:11400 },
  '2026-02-14|Jape|T2B': { reg:24, activePl:34, validTurnover:136602, ggr:-8164, bonus:3112, ngr:-5052, dep:32210, totalWithdrawal:21144 },
  '2026-02-15|Jape|T2B': { reg:23, activePl:24, validTurnover:214887, ggr:-27889, bonus:799, ngr:-27090, dep:32530, totalWithdrawal:8310 },
  '2026-02-16|Jape|T2B': { reg:12, activePl:26, validTurnover:207686, ggr:-26829, bonus:1087, ngr:-25743, dep:39040, totalWithdrawal:13383 },
  '2026-02-17|Jape|T2B': { reg:20, activePl:28, validTurnover:283092, ggr:130632, bonus:1734, ngr:132367, dep:31205, totalWithdrawal:158000 },
  '2026-02-18|Jape|T2B': { reg:19, activePl:28, validTurnover:265298, ggr:-17181, bonus:1543, ngr:-15638, dep:25831, totalWithdrawal:16850 },
  '2026-02-19|Jape|T2B': { reg:16, activePl:29, validTurnover:425274, ggr:-70386, bonus:1347, ngr:-69039, dep:100214, totalWithdrawal:33000 },
  '2026-02-20|Jape|T2B': { reg:46, activePl:34, validTurnover:759665, ggr:-96068, bonus:2180, ngr:-93888, dep:121665, totalWithdrawal:19700 },
  '2026-02-21|Jape|T2B': { reg:108, activePl:42, validTurnover:310477, ggr:-31924, bonus:1311, ngr:-30613, dep:59384, totalWithdrawal:19954 },
  '2026-02-22|Jape|T2B': { reg:36, activePl:40, validTurnover:223134, ggr:-21631, bonus:1471, ngr:-20160, dep:18191, totalWithdrawal:12635 },
  '2026-02-23|Jape|T2B': { reg:26, activePl:37, validTurnover:236361, ggr:10710, bonus:1571, ngr:12280, dep:16451, totalWithdrawal:30350 },
  '2026-02-24|Jape|T2B': { reg:18, activePl:33, validTurnover:353253, ggr:16695, bonus:2696, ngr:19391, dep:33692, totalWithdrawal:48600 },
  '2026-02-25|Jape|T2B': { reg:18, activePl:35, validTurnover:249587, ggr:-15232, bonus:1151, ngr:-14081, dep:24263, totalWithdrawal:5655 },
  '2026-02-26|Jape|T2B': { reg:9, activePl:37, validTurnover:518003, ggr:-12776, bonus:1081, ngr:-11695, dep:31440, totalWithdrawal:23545 },
  // Ribo / T2B
  '2026-02-03|Ribo|T2B': { reg:5, activePl:1, validTurnover:1542, ggr:374, bonus:0, ngr:374, dep:245, totalWithdrawal:0 },
  '2026-02-04|Ribo|T2B': { reg:30, activePl:9, validTurnover:34819, ggr:-5341, bonus:370, ngr:-4971, dep:4660, totalWithdrawal:300 },
  '2026-02-05|Ribo|T2B': { reg:11, activePl:5, validTurnover:4254, ggr:-1350, bonus:394, ngr:-955, dep:1000, totalWithdrawal:0 },
  '2026-02-06|Ribo|T2B': { reg:79, activePl:25, validTurnover:30141, ggr:-5940, bonus:900, ngr:-5040, dep:7478, totalWithdrawal:1292 },
  '2026-02-07|Ribo|T2B': { reg:47, activePl:19, validTurnover:99675, ggr:-6517, bonus:720, ngr:-5797, dep:4850, totalWithdrawal:168 },
  '2026-02-08|Ribo|T2B': { reg:23, activePl:12, validTurnover:60118, ggr:-765, bonus:200, ngr:-565, dep:5444, totalWithdrawal:2500 },
  '2026-02-09|Ribo|T2B': { reg:44, activePl:15, validTurnover:41692, ggr:-7886, bonus:322, ngr:-7564, dep:7639, totalWithdrawal:2000 },
  '2026-02-10|Ribo|T2B': { reg:43, activePl:22, validTurnover:212268, ggr:-19262, bonus:1980, ngr:-17282, dep:26680, totalWithdrawal:7504 },
  '2026-02-11|Ribo|T2B': { reg:31, activePl:19, validTurnover:89653, ggr:-7931, bonus:1420, ngr:-6511, dep:8373, totalWithdrawal:2600 },
  '2026-02-12|Ribo|T2B': { reg:19, activePl:17, validTurnover:97631, ggr:-8754, bonus:1003, ngr:-7751, dep:11204, totalWithdrawal:4500 },
  '2026-02-13|Ribo|T2B': { reg:19, activePl:19, validTurnover:70530, ggr:-3878, bonus:576, ngr:-3302, dep:7850, totalWithdrawal:3715 },
  '2026-02-14|Ribo|T2B': { reg:21, activePl:20, validTurnover:41252, ggr:-6615, bonus:280, ngr:-6335, dep:7201, totalWithdrawal:600 },
  '2026-02-15|Ribo|T2B': { reg:21, activePl:14, validTurnover:49272, ggr:3482, bonus:206, ngr:3688, dep:4696, totalWithdrawal:6900 },
  '2026-02-16|Ribo|T2B': { reg:19, activePl:14, validTurnover:56349, ggr:-3657, bonus:550, ngr:-3107, dep:5085, totalWithdrawal:2900 },
  '2026-02-17|Ribo|T2B': { reg:34, activePl:22, validTurnover:62739, ggr:-2998, bonus:979, ngr:-2020, dep:7450, totalWithdrawal:5349 },
  '2026-02-18|Ribo|T2B': { reg:19, activePl:11, validTurnover:25525, ggr:-5868, bonus:470, ngr:-5398, dep:5100, totalWithdrawal:1200 },
  '2026-02-19|Ribo|T2B': { reg:16, activePl:14, validTurnover:23444, ggr:-2946, bonus:485, ngr:-2461, dep:4068, totalWithdrawal:1200 },
  '2026-02-20|Ribo|T2B': { reg:8, activePl:10, validTurnover:29104, ggr:-1396, bonus:830, ngr:-566, dep:3500, totalWithdrawal:1431 },
  '2026-02-21|Ribo|T2B': { reg:20, activePl:12, validTurnover:31588, ggr:2324, bonus:540, ngr:2864, dep:6039, totalWithdrawal:10100 },
  '2026-02-22|Ribo|T2B': { reg:17, activePl:14, validTurnover:46297, ggr:9111, bonus:480, ngr:9591, dep:3218, totalWithdrawal:13000 },
  '2026-02-23|Ribo|T2B': { reg:48, activePl:21, validTurnover:34639, ggr:-6439, bonus:843, ngr:-5596, dep:6585, totalWithdrawal:200 },
  '2026-02-24|Ribo|T2B': { reg:23, activePl:14, validTurnover:20217, ggr:-4826, bonus:430, ngr:-4396, dep:4041, totalWithdrawal:687 },
  '2026-02-25|Ribo|T2B': { reg:15, activePl:14, validTurnover:37282, ggr:-872, bonus:470, ngr:-402, dep:8050, totalWithdrawal:7591 },
  '2026-02-26|Ribo|T2B': { reg:5, activePl:18, validTurnover:42034, ggr:-4639, bonus:232, ngr:-4407, dep:5650, totalWithdrawal:800 },
  // Krilla / T2B
  '2026-02-23|Krilla|T2B': { reg:2, activePl:2, validTurnover:3585, ggr:-249, bonus:150, ngr:-99, dep:500, totalWithdrawal:400 },
  '2026-02-24|Krilla|T2B': { reg:3, activePl:2, validTurnover:2041, ggr:-699, bonus:200, ngr:-499, dep:600, totalWithdrawal:100 },
  '2026-02-25|Krilla|T2B': { reg:4, activePl:1, validTurnover:1184, ggr:-500, bonus:0, ngr:-500, dep:500, totalWithdrawal:0 },
  '2026-02-26|Krilla|T2B': { reg:2, activePl:1, validTurnover:252, ggr:-199, bonus:0, ngr:-199, dep:0, totalWithdrawal:0 },
  // Yuji / T2B
  '2026-02-07|Yuji|T2B': { reg:24, activePl:6, validTurnover:18521, ggr:-889, bonus:0, ngr:-889, dep:9050, totalWithdrawal:500 },
  '2026-02-08|Yuji|T2B': { reg:9, activePl:7, validTurnover:31061, ggr:-18297, bonus:50, ngr:-18247, dep:11000, totalWithdrawal:400 },
  '2026-02-09|Yuji|T2B': { reg:6, activePl:2, validTurnover:9337, ggr:-1178, bonus:0, ngr:-1178, dep:2680, totalWithdrawal:1500 },
  '2026-02-10|Yuji|T2B': { reg:6, activePl:3, validTurnover:2222, ggr:-499, bonus:0, ngr:-499, dep:700, totalWithdrawal:200 },
  '2026-02-11|Yuji|T2B': { reg:19, activePl:6, validTurnover:12825, ggr:-1660, bonus:375, ngr:-1285, dep:1450, totalWithdrawal:0 },
  '2026-02-12|Yuji|T2B': { reg:17, activePl:14, validTurnover:108841, ggr:19088, bonus:744, ngr:19832, dep:7643, totalWithdrawal:23193 },
  '2026-02-13|Yuji|T2B': { reg:7, activePl:10, validTurnover:83334, ggr:2204, bonus:620, ngr:2824, dep:9855, totalWithdrawal:17000 },
  '2026-02-14|Yuji|T2B': { reg:18, activePl:12, validTurnover:37376, ggr:-6965, bonus:388, ngr:-6577, dep:7950, totalWithdrawal:1000 },
  '2026-02-15|Yuji|T2B': { reg:9, activePl:9, validTurnover:17613, ggr:-1136, bonus:50, ngr:-1086, dep:1901, totalWithdrawal:1000 },
  '2026-02-16|Yuji|T2B': { reg:32, activePl:11, validTurnover:7195, ggr:-150, bonus:190, ngr:40, dep:1790, totalWithdrawal:499 },
  '2026-02-17|Yuji|T2B': { reg:27, activePl:11, validTurnover:24927, ggr:-5424, bonus:0, ngr:-5424, dep:4950, totalWithdrawal:1000 },
  '2026-02-18|Yuji|T2B': { reg:36, activePl:17, validTurnover:70163, ggr:-1765, bonus:540, ngr:-1225, dep:8986, totalWithdrawal:7531 },
  '2026-02-19|Yuji|T2B': { reg:8, activePl:13, validTurnover:110959, ggr:-4146, bonus:180, ngr:-3966, dep:7950, totalWithdrawal:4331 },
  '2026-02-20|Yuji|T2B': { reg:16, activePl:18, validTurnover:23712, ggr:-3800, bonus:393, ngr:-3407, dep:4759, totalWithdrawal:715 },
  '2026-02-21|Yuji|T2B': { reg:13, activePl:13, validTurnover:10983, ggr:-909, bonus:160, ngr:-749, dep:2530, totalWithdrawal:1795 },
  '2026-02-22|Yuji|T2B': { reg:10, activePl:12, validTurnover:16823, ggr:-1382, bonus:20, ngr:-1362, dep:2648, totalWithdrawal:1809 },
  '2026-02-23|Yuji|T2B': { reg:6, activePl:10, validTurnover:19684, ggr:743, bonus:170, ngr:913, dep:3304, totalWithdrawal:3151 },
  '2026-02-24|Yuji|T2B': { reg:13, activePl:13, validTurnover:158914, ggr:3993, bonus:340, ngr:4333, dep:8154, totalWithdrawal:13648 },
  '2026-02-25|Yuji|T2B': { reg:27, activePl:12, validTurnover:63832, ggr:-2747, bonus:520, ngr:-2227, dep:4154, totalWithdrawal:1500 },
  '2026-02-26|Yuji|T2B': { reg:18, activePl:14, validTurnover:42635, ggr:-1231, bonus:440, ngr:-791, dep:5600, totalWithdrawal:2433 },
  // Wrecker / T2B
  '2026-02-09|Wrecker|T2B': { reg:40, activePl:13, validTurnover:19844, ggr:-1979, bonus:470, ngr:-1509, dep:4195, totalWithdrawal:400 },
  '2026-02-10|Wrecker|T2B': { reg:51, activePl:29, validTurnover:304943, ggr:-9550, bonus:2948, ngr:-6602, dep:16004, totalWithdrawal:4608 },
  '2026-02-11|Wrecker|T2B': { reg:29, activePl:25, validTurnover:93124, ggr:-9995, bonus:1393, ngr:-8601, dep:15303, totalWithdrawal:12607 },
  '2026-02-12|Wrecker|T2B': { reg:18, activePl:20, validTurnover:239846, ggr:-26929, bonus:860, ngr:-26069, dep:39952, totalWithdrawal:14000 },
  '2026-02-13|Wrecker|T2B': { reg:16, activePl:18, validTurnover:127288, ggr:-8211, bonus:1803, ngr:-6408, dep:10267, totalWithdrawal:4000 },
  '2026-02-14|Wrecker|T2B': { reg:4, activePl:15, validTurnover:46525, ggr:-1775, bonus:377, ngr:-1399, dep:6199, totalWithdrawal:4800 },
  '2026-02-15|Wrecker|T2B': { reg:2, activePl:11, validTurnover:34114, ggr:-6213, bonus:370, ngr:-5843, dep:5820, totalWithdrawal:320 },
  '2026-02-16|Wrecker|T2B': { reg:0, activePl:6, validTurnover:7208, ggr:-1463, bonus:68, ngr:-1395, dep:1300, totalWithdrawal:0 },
  '2026-02-17|Wrecker|T2B': { reg:1, activePl:9, validTurnover:8285, ggr:-1199, bonus:100, ngr:-1099, dep:1600, totalWithdrawal:500 },
  '2026-02-18|Wrecker|T2B': { reg:51, activePl:22, validTurnover:29359, ggr:-4795, bonus:1200, ngr:-3595, dep:5790, totalWithdrawal:450 },
  '2026-02-19|Wrecker|T2B': { reg:31, activePl:24, validTurnover:89276, ggr:25955, bonus:1312, ngr:27267, dep:7911, totalWithdrawal:36722 },
  '2026-02-20|Wrecker|T2B': { reg:7, activePl:12, validTurnover:55714, ggr:-5156, bonus:175, ngr:-4981, dep:6550, totalWithdrawal:1590 },
  '2026-02-21|Wrecker|T2B': { reg:230, activePl:29, validTurnover:39555, ggr:-4858, bonus:660, ngr:-4198, dep:5827, totalWithdrawal:500 },
  '2026-02-22|Wrecker|T2B': { reg:19, activePl:31, validTurnover:53736, ggr:-5019, bonus:825, ngr:-4194, dep:7278, totalWithdrawal:3977 },
  '2026-02-23|Wrecker|T2B': { reg:146, activePl:32, validTurnover:93230, ggr:-7947, bonus:3120, ngr:-4827, dep:10954, totalWithdrawal:3019 },
  '2026-02-24|Wrecker|T2B': { reg:15, activePl:35, validTurnover:51706, ggr:-7066, bonus:1422, ngr:-5643, dep:7648, totalWithdrawal:3938 },
  '2026-02-25|Wrecker|T2B': { reg:33, activePl:39, validTurnover:86435, ggr:-17878, bonus:1588, ngr:-16290, dep:18695, totalWithdrawal:1700 },
  '2026-02-26|Wrecker|T2B': { reg:36, activePl:40, validTurnover:277683, ggr:-11364, bonus:4270, ngr:-7094, dep:17682, totalWithdrawal:5265 },
  // Trixie / T2B
  '2026-02-21|Trixie|T2B': { reg:9, activePl:3, validTurnover:1663, ggr:-643, bonus:250, ngr:-393, dep:700, totalWithdrawal:0 },
  '2026-02-22|Trixie|T2B': { reg:54, activePl:15, validTurnover:82663, ggr:-6448, bonus:1194, ngr:-5254, dep:7747, totalWithdrawal:1300 },
  '2026-02-23|Trixie|T2B': { reg:55, activePl:18, validTurnover:44269, ggr:-1180, bonus:978, ngr:-202, dep:5203, totalWithdrawal:0 },
  '2026-02-24|Trixie|T2B': { reg:10, activePl:11, validTurnover:37152, ggr:-2746, bonus:580, ngr:-2166, dep:4552, totalWithdrawal:3900 },
  '2026-02-25|Trixie|T2B': { reg:6, activePl:6, validTurnover:14753, ggr:-1672, bonus:40, ngr:-1632, dep:500, totalWithdrawal:400 },
  '2026-02-26|Trixie|T2B': { reg:1, activePl:6, validTurnover:8463, ggr:-337, bonus:210, ngr:-127, dep:1100, totalWithdrawal:1000 },
};

// ─── Date Range Picker ───────────────────────────────────────────────────────
function DateRangePicker({ startDate, endDate, onStartChange, onEndChange, minDate, maxDate }) {
  const [open, setOpen] = React.useState(false);
  const [hoverDate, setHoverDate] = React.useState(null);
  const [stage, setStage] = React.useState('start'); // 'start' | 'end'
  const [showPresets, setShowPresets] = React.useState(false);
  const ref = React.useRef(null);

  const parsedStart = startDate ? new Date(startDate + 'T00:00:00') : new Date();
  const [leftYear, setLeftYear] = React.useState(parsedStart.getFullYear());
  const [leftMonth, setLeftMonth] = React.useState(parsedStart.getMonth());

  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;
  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1;

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setShowPresets(false); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const MNAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const DNAMES = ['S','M','T','W','T','F','S'];

  const toYMD = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const todayYMD = () => { const d = new Date(); return toYMD(d.getFullYear(), d.getMonth(), d.getDate()); };
  const fmt = (s) => { if (!s) return '—'; const [y,m,d] = s.split('-'); return `${MNAMES[+m-1]} ${+d}, ${y}`; };

  const prevMonth = () => { if (leftMonth === 0) { setLeftYear(y => y-1); setLeftMonth(11); } else setLeftMonth(m => m-1); };
  const nextMonth = () => { if (leftMonth === 11) { setLeftYear(y => y+1); setLeftMonth(0); } else setLeftMonth(m => m+1); };

  const handleDayClick = (ymd) => {
    if (stage === 'start') {
      onStartChange(ymd); onEndChange(ymd);
      setStage('end');
    } else {
      if (ymd < startDate) { onStartChange(ymd); setStage('end'); }
      else { onEndChange(ymd); setStage('start'); setOpen(false); }
    }
  };

  const applyPreset = (key) => {
    const tm = new Date();
    const toYMDd = (d) => toYMD(d.getFullYear(), d.getMonth(), d.getDate());
    const today = toYMDd(tm);
    const nd = (n) => { const s = new Date(); s.setDate(s.getDate()-(n-1)); return toYMDd(s); };

    // yesterday
    const yd = new Date(tm); yd.setDate(tm.getDate()-1);
    const yesterday = toYMDd(yd);

    // this week Mon–today
    const twStart = new Date(tm); twStart.setDate(tm.getDate() - ((tm.getDay()+6)%7));

    // last week Mon–Sun
    const lwEnd = new Date(twStart); lwEnd.setDate(twStart.getDate()-1);
    const lwStart = new Date(lwEnd); lwStart.setDate(lwEnd.getDate()-6);

    // this month
    const tmStart = new Date(tm.getFullYear(), tm.getMonth(), 1);
    const tmEnd   = new Date(tm.getFullYear(), tm.getMonth()+1, 0);

    // last month
    const lmStart = new Date(tm.getFullYear(), tm.getMonth()-1, 1);
    const lmEnd   = new Date(tm.getFullYear(), tm.getMonth(), 0);

    // this quarter
    const q = Math.floor(tm.getMonth()/3);
    const tqStart = new Date(tm.getFullYear(), q*3, 1);
    const tqEnd   = new Date(tm.getFullYear(), q*3+3, 0);

    // last quarter
    const lq = (q - 1 + 4) % 4;
    const lqYear = q === 0 ? tm.getFullYear()-1 : tm.getFullYear();
    const lqStart = new Date(lqYear, lq*3, 1);
    const lqEnd   = new Date(lqYear, lq*3+3, 0);

    // this year
    const tyStart = new Date(tm.getFullYear(), 0, 1);
    const tyEnd   = new Date(tm.getFullYear(), 11, 31);

    // last year
    const lyStart = new Date(tm.getFullYear()-1, 0, 1);
    const lyEnd   = new Date(tm.getFullYear()-1, 11, 31);

    const presets = {
      today:        [today, today],
      yesterday:    [yesterday, yesterday],
      thisweek:     [toYMDd(twStart), today],
      lastweek:     [toYMDd(lwStart), toYMDd(lwEnd)],
      thismonth:    [toYMDd(tmStart), toYMDd(tmEnd)],
      lastmonth:    [toYMDd(lmStart), toYMDd(lmEnd)],
      thisquarter:  [toYMDd(tqStart), toYMDd(tqEnd)],
      lastquarter:  [toYMDd(lqStart), toYMDd(lqEnd)],
      thisyear:     [toYMDd(tyStart), toYMDd(tyEnd)],
      lastyear:     [toYMDd(lyStart), toYMDd(lyEnd)],
      last7:        [nd(7), today],
      last14:       [nd(14), today],
      last28:       [nd(28), today],
      last30:       [nd(30), today],
      last90:       [nd(90), today],
    };
    if (presets[key]) { onStartChange(presets[key][0]); onEndChange(presets[key][1]); }
    setShowPresets(false); setOpen(false); setStage('start');
  };

  const renderCal = (year, month) => {
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const cells = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const today = todayYMD();
    const effectiveEnd = stage === 'end' && hoverDate && hoverDate >= startDate ? hoverDate : endDate;

    return (
      <div className="w-52">
        <div className="grid grid-cols-7 mb-2">
          {DNAMES.map((d, i) => <div key={i} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} />;
            const ymd = toYMD(year, month, day);
            const isStart = ymd === startDate;
            const isEnd   = ymd === effectiveEnd;
            const inRange = ymd > startDate && ymd < effectiveEnd;
            const isDisabled = (minDate && ymd < minDate) || (maxDate && ymd > maxDate);
            const isToday = ymd === today;
            return (
              <button
                key={idx}
                disabled={isDisabled}
                onClick={() => handleDayClick(ymd)}
                onMouseEnter={() => setHoverDate(ymd)}
                onMouseLeave={() => setHoverDate(null)}
                className={[
                  'h-8 w-full text-xs font-medium transition-all select-none',
                  isDisabled ? 'text-slate-300 cursor-not-allowed' : 'cursor-pointer',
                  isStart ? 'bg-indigo-600 text-white rounded-l-full' : '',
                  isEnd && isStart ? 'rounded-full' : isEnd ? 'bg-indigo-600 text-white rounded-r-full' : '',
                  inRange ? 'bg-indigo-100 text-indigo-800' : '',
                  !isStart && !isEnd && !inRange && !isDisabled ? 'hover:bg-indigo-50 rounded-full' : '',
                  isToday && !isStart && !isEnd ? 'font-bold underline decoration-indigo-400' : '',
                ].filter(Boolean).join(' ')}
              >{day}</button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(o => !o); setStage('start'); setShowPresets(false); }}
        className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs font-medium text-slate-700 hover:border-indigo-400 transition-colors"
      >
        <Calendar size={14} className="text-slate-400" />
        {startDate && endDate ? (
          <>
            <span className="font-semibold text-indigo-700">{fmt(startDate)}</span>
            <span className="text-slate-300">–</span>
            <span className="font-semibold text-indigo-700">{fmt(endDate)}</span>
          </>
        ) : (
          <span className="text-slate-400 italic">Select date range…</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 min-w-max">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-700">Select date range</span>
            <div className="relative">
              <button
                onClick={() => setShowPresets(p => !p)}
                className="flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-50 font-medium"
              >
                Quick select <span className="text-slate-400 text-[10px]">▾</span>
              </button>
              {showPresets && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 w-48 overflow-hidden">
                  {/* --- Relative --- */}
                  <div className="px-4 pt-1 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Relative</div>
                  {[
                    { label: 'Today',          key: 'today' },
                    { label: 'Yesterday',      key: 'yesterday' },
                    { label: 'This week',      key: 'thisweek' },
                    { label: 'Last week',      key: 'lastweek' },
                    { label: 'This month',     key: 'thismonth' },
                    { label: 'Last month',     key: 'lastmonth' },
                    { label: 'This quarter',   key: 'thisquarter' },
                    { label: 'Last quarter',   key: 'lastquarter' },
                    { label: 'This year',      key: 'thisyear' },
                    { label: 'Last year',      key: 'lastyear' },
                  ].map(p => (
                    <button key={p.key} onClick={() => applyPreset(p.key)}
                      className="w-full text-left px-4 py-1.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >{p.label}</button>
                  ))}
                  {/* --- Last N days --- */}
                  <div className="px-4 pt-2 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 mt-1">Last N days</div>
                  {[
                    { label: 'Last 7 days',   key: 'last7' },
                    { label: 'Last 14 days',  key: 'last14' },
                    { label: 'Last 28 days',  key: 'last28' },
                    { label: 'Last 30 days',  key: 'last30' },
                    { label: 'Last 90 days',  key: 'last90' },
                  ].map(p => (
                    <button key={p.key} onClick={() => applyPreset(p.key)}
                      className="w-full text-left px-4 py-1.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >{p.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Calendars */}
          <div className="flex gap-6">
            {/* Left */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 text-base leading-none">‹</button>
                <span className="text-xs font-bold text-slate-700 tracking-wide">{MNAMES[leftMonth]} {leftYear}</span>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 text-base leading-none">›</button>
              </div>
              {renderCal(leftYear, leftMonth)}
            </div>

            <div className="w-px bg-slate-100" />

            {/* Right */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 text-base leading-none">‹</button>
                <span className="text-xs font-bold text-slate-700 tracking-wide">{MNAMES[rightMonth]} {rightYear}</span>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 text-base leading-none">›</button>
              </div>
              {renderCal(rightYear, rightMonth)}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-400 italic">
              {stage === 'end' ? '📅 Now click an end date' : '📅 Click a start date'}
            </span>
            <button
              onClick={() => { setOpen(false); setStage('start'); }}
              className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
            >Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  // --- DATA STATE (localStorage only) ---
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('campaignData_v6');
      return saved ? JSON.parse(saved) : rawData;
    } catch { return rawData; }
  });
  const [loading] = useState(false);

  useEffect(() => {
    localStorage.setItem('campaignData_v6', JSON.stringify(data));
  }, [data]);

  // --- VIEW STATE ---
  const [activeView, setActiveView] = useState('dashboard');
  const [reportSubTab, setReportSubTab] = useState('ads');

  // --- DARK MODE ---
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // --- ADS REPORT DATA ---
  const [adsReportData, setAdsReportData] = useState(() => {
    try {
      const saved = localStorage.getItem('adsReportData');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('adsReportData', JSON.stringify(adsReportData));
  }, [adsReportData]);

  // --- CREATOR PERF DATA ---
  const [creatorPerfData, setCreatorPerfData] = useState(() => {
    try {
      const saved = localStorage.getItem('creatorPerfData');
      if (!saved) return defaultCreatorPerfData;
      const migrateKeys = (obj) => {
        const out = {};
        for (const [k, v] of Object.entries(obj)) {
          const newKey = k.replace('|Aether|', '|WoolFyBets|').replace('|GhostWrecker|', '|Wrecker|');
          out[newKey] = v;
        }
        return out;
      };
      const parsed = migrateKeys(JSON.parse(saved));
      return { ...defaultCreatorPerfData, ...parsed };
    } catch { return defaultCreatorPerfData; }
  });

  useEffect(() => {
    localStorage.setItem('creatorPerfData', JSON.stringify(creatorPerfData));
  }, [creatorPerfData]);

  // --- NO STREAM DATA ---
  const [noStreamData, setNoStreamData] = useState(() => {
    try {
      const saved = localStorage.getItem('noStreamData');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('noStreamData', JSON.stringify(noStreamData));
  }, [noStreamData]);

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
    setAdsReportData(updated);
    setShowAdsModal(false);
  };

  // --- CREATOR SUMMARY (lifted for header cards) ---
  const [creatorSummary, setCreatorSummary] = useState({ spend: 0, dep: 0, ngr: 0, efficacyRate: null });

  // --- CREATOR PERF MODAL STATE ---
  const [showCreatorPerfModal, setShowCreatorPerfModal] = useState(false);
  const [creatorPerfEditKey, setCreatorPerfEditKey] = useState(null);
  const [creatorPerfLabel, setCreatorPerfLabel] = useState('');
  const emptyCreatorPerfForm = { ggr: '', bonus: '', ngr: '', activePl: '', validTurnover: '', totalWithdrawal: '', status: 'Pending' };
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
      status: existing.status !== undefined ? existing.status : null,
    });
    setShowCreatorPerfModal(true);
  };

  const handleCreatorPerfSave = () => {
    const updated = {
      ...creatorPerfData,
      [creatorPerfEditKey]: {
        ggr: parseFloat(creatorPerfFormValues.ggr) || 0,
        bonus: parseFloat(creatorPerfFormValues.bonus) || 0,
        ngr: parseFloat(creatorPerfFormValues.ngr) || 0,
        activePl: parseFloat(creatorPerfFormValues.activePl) || 0,
        validTurnover: parseFloat(creatorPerfFormValues.validTurnover) || 0,
        totalWithdrawal: parseFloat(creatorPerfFormValues.totalWithdrawal) || 0,
        status: creatorPerfFormValues.status !== null ? creatorPerfFormValues.status : undefined,
      },
    };
    setCreatorPerfData(updated);
    setShowCreatorPerfModal(false);
  };

  // --- MODAL STATE ---
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // Firestore id OR array index
  const emptyForm = { date: new Date().toISOString().split('T')[0], site: 'WFL', streamer: '', spend: '', reg: '', dep: '', type: 'Live', link: '', status: 'Pending' };
  const [formValues, setFormValues] = useState(emptyForm);

  const openAddModal = () => {
    setEditingId(null);
    setFormValues({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(data.indexOf(item));
    const { id: _id, ...rest } = item;
    setFormValues({ status: 'Pending', ...rest, spend: String(item.spend), reg: String(item.reg), dep: String(item.dep) });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formValues.date || !formValues.streamer) return;
    const { id: _id, ...formClean } = formValues;
    const entry = { ...formClean, spend: parseFloat(formClean.spend) || 0, reg: parseInt(formClean.reg) || 0, dep: parseFloat(formClean.dep) || 0 };
    if (editingId !== null) {
      const updated = [...data];
      updated[editingId] = entry;
      setData(updated);
    } else {
      setData(prev => [...prev, entry]);
    }
    setShowModal(false);
  };

  const handleDelete = (item) => {
    if (window.confirm('Delete this entry?')) {
      setData(prev => prev.filter(d => d !== item));
    }
  };

  const handleDeleteDay = (dayEntries) => {
    if (window.confirm(`Delete all ${dayEntries.length} entr${dayEntries.length === 1 ? 'y' : 'ies'} for this day?`)) {
      setData(prev => prev.filter(d => !dayEntries.includes(d)));
    }
  };

  const handleMarkNoStream = (date, streamer, site) => {
    const key = `${date}|${streamer}|${site}`;
    setNoStreamData(prev => ({ ...prev, [key]: true }));
  };

  const handleUnmarkNoStream = (key) => {
    setNoStreamData(prev => { const u = { ...prev }; delete u[key]; return u; });
  };

  const handleResetData = () => {
    if (window.confirm('Reset all data back to the original? All added entries will be lost.')) {
      setData(rawData);
    }
  };

  const handleDeduplicateData = () => {
    const seen = new Set();
    const deduped = data.filter(e => {
      const key = `${e.date}|${e.site}|${e.streamer}|${e.link}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const removed = data.length - deduped.length;
    if (removed === 0) {
      alert('No duplicates found.');
      return;
    }
    if (window.confirm(`Found ${removed} duplicate entr${removed === 1 ? 'y' : 'ies'}. Remove them?`)) {
      setData(deduped);
    }
  };

  // ─── CSV HELPERS ──────────────────────────────────────────────────────────
  function parseCsvLine(line, delimiter = ',') {
    const result = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; }
      else if (c === delimiter && !inQ) { result.push(cur.trim()); cur = ''; }
      else { cur += c; }
    }
    result.push(cur.trim());
    return result;
  }

  function cleanNum(val) {
    if (val === null || val === undefined || val === '') return 0;
    return parseFloat(String(val).replace(/[₱,\s]/g, '')) || 0;
  }

  function normDate(s) {
    if (!s) return '';
    s = s.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mdy) return `${mdy[3]}-${mdy[1].padStart(2,'0')}-${mdy[2].padStart(2,'0')}`;
    const mo = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
    const dmy = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
    if (dmy) { const m = mo[dmy[2].toLowerCase().slice(0,3)]; if (m) return `${dmy[3]}-${String(m).padStart(2,'0')}-${dmy[1].padStart(2,'0')}`; }
    return s;
  }

  function isValidDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s); }

  // ─── EOD FORMAT DETECTION & PARSING ──────────────────────────────────────
  function isEODFormat(text) {
    return /OF DAY REPORT|END OF\s+THE\s+DAY|END OF DAY/i.test(text);
  }

  function siteFromFilename(name) {
    const f = name.toLowerCase();
    if (f.includes('time2bet')) return 'T2B';
    if (f.includes('rollem') || f.includes('_rlm') || f.includes('-rlm')) return 'RLM';
    if (f.includes('_wfl') || f.includes('-wfl') || f.includes('wfl')) return 'WFL';
    if (f.includes('cow')) return 'COW';
    return '';
  }

  // Returns { name, hint } — name is the cleaned header word, hint is bracket/paren content
  function streamerFromHeader(line) {
    // Extract hint from brackets or parens BEFORE stripping: "WOOLFYBETS [AETHER]" → hint "AETHER"
    const bracketMatch = line.match(/\[([^\]]+)\]|\(([^)]+)\)/);
    const hint = bracketMatch ? (bracketMatch[1] || bracketMatch[2]).trim() : '';

    let name = line
      .replace(/\s*:.*$/i, '')              // remove everything after :
      .replace(/\[[^\]]*\]/g, '')           // remove [bracket] content
      .replace(/\([^)]*\)/g, '')            // remove (paren) content
      .replace(/\s+(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER).*/i, '')
      .replace(/[&]?LP$/i, '')              // strip &LP or LP suffix
      .replace(/^(?:WFL|RLM|T2B|COW)/i, '') // strip site prefix
      .trim();
    const cleanName = name
      ? name.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      : 'Unknown';
    return { name: cleanName, hint };
  }

  // Smart fuzzy match: checks built-in alias dict first (no existing data needed),
  // then falls back to matching against known streamers already in the app.
  function smartMatchStreamer(headerName, hint, aliasName, knownStreamers, filenameHint = '') {
    const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    // ── Step 0: built-in alias dictionary (works with zero existing data) ──
    const tryAlias = (raw) => {
      const n = norm(raw);
      if (!n || n.length < 2) return null;
      // exact key
      if (STREAMER_ALIASES[n]) return STREAMER_ALIASES[n];
      // csv token contains an alias key ("saintymaxwin" → "sainty")
      for (const [key, val] of Object.entries(STREAMER_ALIASES)) {
        if (key.length >= 3 && n.includes(key)) return val;
      }
      // alias key contains csv token ("neggy" inside "neggytv")
      for (const [key, val] of Object.entries(STREAMER_ALIASES)) {
        if (key.length >= 3 && key.startsWith(n) && n.length >= 3) return val;
      }
      return null;
    };

    const fromAlias =
      tryAlias(hint) ||
      tryAlias(filenameHint) ||
      tryAlias(headerName) ||
      tryAlias(aliasName);
    if (fromAlias) return fromAlias;

    // ── Step 1: match against live streamer list (when app already has data) ──
    if (!knownStreamers.length) return null;
    const pool = knownStreamers.map(s => ({ name: s, n: norm(s) }));

    const tryName = (raw) => {
      const n = norm(raw);
      if (!n || n.length < 2) return null;
      const exact = pool.find(k => k.n === n);
      if (exact) return exact.name;
      const contained = pool.find(k => k.n.length >= 3 && n.includes(k.n));
      if (contained) return contained.name;
      const csvStartsKnown = pool.find(k => k.n.length >= 3 && k.n.startsWith(n) && n.length >= 3);
      if (csvStartsKnown) return csvStartsKnown.name;
      const knownStartsCsv = pool.find(k => k.n.length >= 3 && n.startsWith(k.n));
      if (knownStartsCsv) return knownStartsCsv.name;
      return null;
    };

    return tryName(hint) || tryName(filenameHint) || tryName(headerName) || tryName(aliasName) || null;
  }

  // Extract a streamer name hint embedded in the CSV filename.
  // e.g. "UNRAVEL EOD TALENTS - WFL - HOLYFATHER.csv" → "HOLYFATHER"
  function streamerHintFromFilename(filename) {
    const base = filename.replace(/\.[^.]+$/, ''); // strip extension
    // Split on common separators and grab non-keyword tokens
    const skipWords = new Set(['unravel','eod','talents','talent','wfl','rlm','t2b','cow','time2bet','rollem','the','of','end','day','report']);
    const tokens = base.split(/[\s\-_]+/).map(t => t.trim().toLowerCase()).filter(t => t.length >= 3 && !skipWords.has(t));
    // Return the first token that has a known alias (most specific match)
    for (const t of tokens) {
      const matched = STREAMER_ALIASES[t];
      if (matched) return matched;
      // partial: alias key inside token or vice-versa
      for (const [key, val] of Object.entries(STREAMER_ALIASES)) {
        if (key.length >= 3 && (t.includes(key) || key.startsWith(t))) return val;
      }
    }
    return null;
  }

  function parseEODCsv(text, filename) {
    const detectedSite = siteFromFilename(filename);
    const lines = text.split(/\r?\n/);
    const sections = [];
    let cur = null;
    let inData = false;

    const isHeaderLine = (line) =>
      /(?:OF DAY REPORT|END OF\s+THE\s+DAY|END OF DAY)/i.test(line) &&
      !/^,/.test(line.trim());

    const isColHeaderLine = (cols) =>
      cols[0]?.toUpperCase().trim() === 'DAY' &&
      cols[1]?.toUpperCase().includes('REGISTER');

    const isSummaryLine = (cols) =>
      cols[1]?.toUpperCase().includes('TOTAL') ||
      /^Demo and With Risk/i.test(cols[0] || '');

    for (const raw of lines) {
      const cols = parseCsvLine(raw);
      const first = (cols[0] || '').trim();

      if (isHeaderLine(raw)) {
        if (cur && cur.rows.length > 0) sections.push(cur);
        const { name: parsedName, hint } = streamerFromHeader(first);
        cur = { streamer: parsedName, hint, editName: parsedName, alias: '', site: detectedSite, selected: true, rows: [] };
        inData = false;
        continue;
      }
      if (!cur) continue;
      if (isColHeaderLine(cols)) { inData = true; continue; }
      if (!inData) continue;
      if (isSummaryLine(cols)) {
        // Capture the TOTAL row's first cell as an alias (e.g. "ajheib", "akosipepper", "MageDadYujii")
        if (first && !first.startsWith(',')) cur.alias = first;
        continue;
      }

      const dateVal = normDate(first);
      if (!isValidDate(dateVal)) continue;
      // Skip empty strings
      if (!cols[1] && !cols[7]) continue;
      // Skip all-zero rows (future placeholder dates)
      const _reg = cleanNum(cols[1]);
      const _dep = cleanNum(cols[7]);
      const _ggr = cleanNum(cols[4]);
      const _ngr = cleanNum(cols[6]);
      const _vt  = cleanNum(cols[3]);
      const _apl = cleanNum(cols[2]);
      if (_reg === 0 && _dep === 0 && _ggr === 0 && _ngr === 0 && _vt === 0 && _apl === 0) continue;

      cur.rows.push({
        date: dateVal,
        reg:             Math.round(cleanNum(cols[1])),
        activePl:        cleanNum(cols[2]),
        validTurnover:   cleanNum(cols[3]),
        ggr:             cleanNum(cols[4]),
        bonus:           cleanNum(cols[5]),
        ngr:             cleanNum(cols[6]),
        dep:             cleanNum(cols[7]),
        totalWithdrawal: cleanNum(cols[8]),
      });
    }
    if (cur && cur.rows.length > 0) sections.push(cur);
    return { sections, detectedSite };
  }

  // ─── FLAT CSV PARSING (Campaign Data) ────────────────────────────────────
  function parseFlatCSV(text) {
    // Filter lines that are truly empty OR contain only commas/tabs/spaces (no real content)
    const lines = text.split(/\r?\n/).filter(l => l.replace(/[,\t\s]/g, '').length > 0);
    if (lines.length < 2) return { headers: [], rows: [] };
    const delim = lines[0].split('\t').length > lines[0].split(',').length ? '\t' : ',';

    // Detect the actual header row — some CSVs (e.g. MEDIA BUYER tracker) have a title row
    // like "MEDIA BUYER'S TRACKER,,..." before the real column headers.
    // Scan the first 10 lines for the one that contains recognised field keywords.
    const headerKeywords = ['date','name','talent','streamer','cost','spend','format','link','reg','dep','site'];
    const normH = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    let headerLineIdx = 0;
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const cells = parseCsvLine(lines[i], delim);
      const nonEmpty = cells.filter(c => c.trim());
      if (nonEmpty.length >= 2 && nonEmpty.some(c => headerKeywords.some(k => normH(c).includes(k)))) {
        headerLineIdx = i;
        break;
      }
    }

    const headers = parseCsvLine(lines[headerLineIdx], delim);
    const rows = lines.slice(headerLineIdx + 1).map(l => parseCsvLine(l, delim));
    return { headers, rows };
  }

  function autoMapColumns(headers) {
    const mapping = {};
    const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchers = {
      date:     ['date','livestreamdate','streamdate','day'],
      site:     ['site'],
      streamer: ['streamer','talentsname','talent','name','creator'],
      spend:    ['spend','cost','adspend','adcost'],
      reg:      ['reg','register','registers','registrations'],
      dep:      ['dep','deposit','deposits','totaldeposit'],
      type:     ['type','format'],
      link:     ['link','url','livestreamlink'],
    };
    headers.forEach((h, i) => {
      const n = norm(h);
      for (const [field, ms] of Object.entries(matchers)) {
        if (mapping[field] === undefined && ms.some(m => n.includes(m))) mapping[field] = String(i);
      }
    });
    return mapping;
  }

  function buildCampaignPreview(rawRows, mapping) {
    return rawRows.map(row => ({
      date:     normDate(mapping.date     !== undefined ? row[parseInt(mapping.date)]     : ''),
      site:     mapping.site !== undefined
                  ? (row[parseInt(mapping.site)] || '').trim()
                  : (mapping._defaultSite || ''),
      streamer: mapping.streamer !== undefined ? (row[parseInt(mapping.streamer)] || '').trim() : '',
      spend:    cleanNum(mapping.spend !== undefined ? row[parseInt(mapping.spend)] : 0),
      reg:      Math.round(cleanNum(mapping.reg !== undefined ? row[parseInt(mapping.reg)] : 0)),
      dep:      cleanNum(mapping.dep   !== undefined ? row[parseInt(mapping.dep)]   : 0),
      type:     (() => { const raw = (mapping.type !== undefined ? (row[parseInt(mapping.type)] || 'Live') : 'Live').trim(); return /livestream/i.test(raw) ? 'Live' : raw; })(),
      link:     mapping.link !== undefined ? (row[parseInt(mapping.link)] || '').trim() : '',
    })).filter(r => r.date && r.streamer);
  }

  // ─── IMPORT STATE ─────────────────────────────────────────────────────────
  const [showImportModal, setShowImportModal]   = useState(false);
  const [importEODOnly,   setImportEODOnly]     = useState(false); // true when opened from Creator Report
  const [importStep,      setImportStep]        = useState(1);
  const [importMode,      setImportMode]        = useState(null);   // 'eod' | 'campaign'
  const [importDragOver,  setImportDragOver]    = useState(false);
  const [importResult,    setImportResult]      = useState(null);
  const importFileRef = useRef(null);

  const openEODImport = () => { setImportEODOnly(true); setShowImportModal(true); };

  // EOD-specific state
  const [eodSections, setEodSections]   = useState([]);   // [{ streamer, editName, site, selected, rows }]
  const [eodSite,     setEodSite]       = useState('');

  // Campaign-specific state
  const [campHeaders,  setCampHeaders]  = useState([]);
  const [campRawRows,  setCampRawRows]  = useState([]);
  const [campMapping,  setCampMapping]  = useState({});
  const [campPreview,  setCampPreview]  = useState([]);
  const campRequiredFields = ['date', 'site', 'streamer'];
  const campAllFields      = ['date', 'site', 'streamer', 'spend', 'reg', 'dep', 'type', 'link'];

  // ─── IMPORT HANDLERS ──────────────────────────────────────────────────────
  const handleImportFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      if (importEODOnly && !isEODFormat(text)) {
        alert('❌ This file is not an UNRAVEL EOD TALENTS report.\nPlease upload the correct EOD CSV file.');
        return;
      }
      if (isEODFormat(text)) {
        const { sections, detectedSite } = parseEODCsv(text, file.name);
        // Extract a streamer hint from the filename (e.g. "WFL - HOLYFATHER.csv" → "HolyFather")
        const fnHint = streamerHintFromFilename(file.name);
        // When file has only ONE section and the filename contains a streamer name,
        // use the filename hint as a stronger signal than the section header.
        const useFnHintDirect = sections.length === 1 && !!fnHint;
        const matched = sections.map(sec => {
          const known = useFnHintDirect
            ? fnHint
            : smartMatchStreamer(sec.streamer, sec.hint, sec.alias, streamers, fnHint);
          const resolvedName = known || sec.streamer;
          const autoMatched = resolvedName !== sec.streamer; // did we improve on the raw header?
          return { ...sec, editName: resolvedName, autoMatched };
        });
        setEodSections(matched);
        setEodSite(detectedSite);
        setImportMode('eod');
      } else {
        const { headers, rows } = parseFlatCSV(text);
        if (!headers.length) return;
        const mapping = autoMapColumns(headers);
        // If no site column was found, infer the site from the filename
        // (e.g. "MEDIA BUYER & TALENTS _ TRACKER - ROLLEM.csv" → 'RLM')
        if (mapping.site === undefined) {
          const siteHint = siteFromFilename(file.name);
          if (siteHint) mapping._defaultSite = siteHint;
        }
        setCampHeaders(headers);
        setCampRawRows(rows);
        setCampMapping(mapping);
        setCampPreview(buildCampaignPreview(rows, mapping));
        setImportMode('campaign');
      }
      setImportStep(2);
    };
    reader.readAsText(file);
  };

  const handleEODImport = () => {
    const site = eodSite;
    const newPerf = { ...creatorPerfData };
    let count = 0;
    eodSections.filter(s => s.selected).forEach(section => {
      section.rows.forEach(row => {
        const key = `${row.date}|${section.editName}|${site}`;
        newPerf[key] = {
          ggr:             row.ggr,
          bonus:           row.bonus,
          ngr:             row.ngr,
          activePl:        row.activePl,
          validTurnover:   row.validTurnover,
          totalWithdrawal: row.totalWithdrawal,
          reg:             row.reg,
          dep:             row.dep,
        };
        count++;
      });
    });
    setCreatorPerfData(newPerf);
    setImportResult({ imported: count, skipped: 0, mode: 'eod' });
    setImportStep(3);
  };

  const handleCampaignImport = (skipDuplicates) => {
    const isDup = (e) => data.some(d =>
      d.date === e.date && d.site === e.site && d.streamer === e.streamer && d.link === e.link
    );
    const toImport = skipDuplicates ? campPreview.filter(e => !isDup(e)) : campPreview;
    const skipped  = campPreview.length - toImport.length;
    setData(prev => [...prev, ...toImport]);
    setImportResult({ imported: toImport.length, skipped, mode: 'campaign' });
    setImportStep(3);
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportEODOnly(false);
    setImportStep(1);
    setImportMode(null);
    setEodSections([]);
    setEodSite('');
    setCampHeaders([]);
    setCampRawRows([]);
    setCampMapping({});
    setCampPreview([]);
    setImportResult(null);
  };

  const uniqueDates = useMemo(() => [...new Set(data.map(d => d.date))].sort(), [data]);

  // minDate and maxDate both consider campaign data AND EOD creatorPerfData dates
  // so the date range is always valid even when campaign data is empty
  const minDate = useMemo(() => {
    const perfDates = Object.keys(creatorPerfData).map(k => k.split('|')[0]);
    const all = [...uniqueDates, ...perfDates].filter(Boolean).sort();
    return all[0] || '';
  }, [uniqueDates, creatorPerfData]);

  const maxDate = useMemo(() => {
    const perfDates = Object.keys(creatorPerfData).map(k => k.split('|')[0]);
    const all = [...uniqueDates, ...perfDates].filter(Boolean).sort();
    return all[all.length - 1] || '';
  }, [uniqueDates, creatorPerfData]);

  const [filterSite, setFilterSite] = useState('All');
  const [filterStreamer, setFilterStreamer] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Auto-expand date range only when user has already selected dates and new imported data goes beyond
  useEffect(() => {
    if (minDate && startDate && minDate < startDate) setStartDate(minDate);
  }, [minDate]);

  useEffect(() => {
    if (maxDate && endDate && maxDate > endDate) setEndDate(maxDate);
  }, [maxDate]);

  // --- DERIVED METRICS ---
  const filteredData = useMemo(() => {
    if (!startDate || !endDate) return [];
    return data.filter(item => {
      if (item.site === 'PP') return false;
      const siteMatch = filterSite === 'All' || item.site === filterSite;
      const streamerMatch = filterStreamer === 'All' || item.streamer === filterStreamer;
      const typeMatch = filterType === 'All' || item.type === filterType;
      const dateMatch = (!startDate || item.date >= startDate) && (!endDate || item.date <= endDate);
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
    if (!startDate || !endDate) return 0;
    return Object.entries(creatorPerfData).reduce((sum, [key, val]) => {
      const [date, streamer, site] = key.split('|');
      if (startDate && date < startDate) return sum;
      if (endDate && date > endDate) return sum;
      if (filterSite !== 'All' && site !== filterSite) return sum;
      if (filterStreamer !== 'All' && streamer !== filterStreamer) return sum;
      return sum + (parseFloat(val.ngr) || 0);
    }, 0);
  }, [creatorPerfData, startDate, endDate, filterSite, filterStreamer]);

  const globalCreatorDep = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return Object.entries(creatorPerfData).reduce((sum, [key, val]) => {
      const [date, streamer, site] = key.split('|');
      if (startDate && date < startDate) return sum;
      if (endDate && date > endDate) return sum;
      if (filterSite !== 'All' && site !== filterSite) return sum;
      if (filterStreamer !== 'All' && streamer !== filterStreamer) return sum;
      return sum + (parseFloat(val.dep) || 0);
    }, 0);
  }, [creatorPerfData, startDate, endDate, filterSite, filterStreamer]);

  const globalEfficacyRate = totals.spend > 0 ? (globalCreatorNGR / totals.spend) * 100 : null;

  // Group by Streamer for Summary Table — merged with adsReportData
  const streamerSummary = useMemo(() => {
    const summary = {};

    // Step 1: accumulate ad spend / reg / dep / live+reels counts from filtered campaign data.
    // Boosting is the only metric sourced from adsReportData (it doesn't exist in creatorPerfData).
    filteredData.forEach(item => {
      if (!summary[item.streamer]) {
        summary[item.streamer] = {
          name: item.streamer,
          site: item.site,
          spend: 0, reg: 0, dep: 0,
          ggr: 0, bonus: 0, ngr: 0, boosting: 0,
          liveCount: 0, reelsCount: 0,
        };
      }
      const s = summary[item.streamer];
      s.spend += item.spend;
      s.reg += item.reg;
      s.dep += item.dep;
      if (item.type === 'Live') s.liveCount += 1;
      else if (item.type === 'Reels') s.reelsCount += 1;

      // Boosting only — avoid double-counting per unique site|streamer|type key
      const adsKey = `${item.site}|${item.streamer}|${item.type}`;
      if (!s._adsKeysAdded) s._adsKeysAdded = new Set();
      if (!s._adsKeysAdded.has(adsKey)) {
        s._adsKeysAdded.add(adsKey);
        s.boosting += parseFloat((adsReportData[adsKey] || {}).boosting) || 0;
      }
    });

    // Step 2: merge GGR / Bonus / NGR / dep / reg from creatorPerfData (keyed date|streamer|site).
    // This is the exact same source the Creator Report uses, so totals will always match.
    // If a streamer doesn't appear in campaign data at all (e.g. T2B has no rawData entries),
    // still create a summary row for them so the leaderboard isn't empty.
    Object.entries(creatorPerfData).forEach(([key, val]) => {
      const [date, streamer, site] = key.split('|');
      // Respect the active date range and site / streamer filters
      if (date < startDate || date > endDate) return;
      if (filterSite !== 'All' && site !== filterSite) return;
      if (filterStreamer !== 'All' && streamer !== filterStreamer) return;
      // Create a stub entry if this streamer has no campaign data rows
      if (!summary[streamer]) {
        summary[streamer] = {
          name: streamer,
          site: site,
          spend: 0, reg: 0, dep: 0,
          ggr: 0, bonus: 0, ngr: 0, boosting: 0,
          liveCount: 0, reelsCount: 0,
        };
      }
      summary[streamer].dep   += parseFloat(val.dep)   || 0;
      summary[streamer].reg   += parseFloat(val.reg)   || 0;
      summary[streamer].ggr   += parseFloat(val.ggr)   || 0;
      summary[streamer].bonus += parseFloat(val.bonus) || 0;
      summary[streamer].ngr   += parseFloat(val.ngr)   || 0;
    });

    return Object.values(summary)
      .map(({ _adsKeysAdded, ...rest }) => rest)
      .sort((a, b) => b.dep - a.dep);
  }, [filteredData, adsReportData, creatorPerfData, startDate, endDate, filterSite, filterStreamer]);

  // Chart Data (Daily Totals)
  const chartData = useMemo(() => {
    const daily = {};
    filteredData.forEach(item => {
      if (!daily[item.date]) daily[item.date] = { date: item.date, spend: 0, dep: 0 };
      daily[item.date].spend += item.spend;
      daily[item.date].dep += item.dep;
    });
    // For sites with no campaign rawData (e.g. T2B), pull deposits from creatorPerfData
    Object.entries(creatorPerfData).forEach(([key, val]) => {
      const [date, , site] = key.split('|');
      if (filterSite !== 'All' && site !== filterSite) return;
      if (date < startDate || date > endDate) return;
      if (!daily[date]) daily[date] = { date, spend: 0, dep: 0 };
      // Only add dep from creatorPerfData if filteredData had no campaign entries for this date+site
      // (avoid double-counting for WFL/RLM which already have dep in rawData)
      const hasRawEntry = filteredData.some(d => d.date === date);
      if (!hasRawEntry) {
        daily[date].dep += parseFloat(val.dep) || 0;
      }
    });
    return Object.values(daily).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredData, creatorPerfData, startDate, endDate, filterSite]);

  // Format currency
  const formatPHP = (val) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);
  const formatNum = (val) => new Intl.NumberFormat('en-US').format(val);

  // Calculate ROI
  const getROI = (spend, dep) => {
    if (spend === 0) return dep > 0 ? 1000 : 0; 
    return ((dep - spend) / spend) * 100;
  };

  const totalROI = getROI(totals.spend, totals.dep);

  // Streamers derived from both campaign data AND creatorPerfData keys (date|streamer|site)
  // so the Creator Report dropdown is populated even when no campaign CSV has been uploaded yet.
  const streamers = useMemo(() => {
    const fromData = (filterSite === 'All' ? data : data.filter(d => d.site === filterSite)).map(d => d.streamer);
    const fromPerf = Object.keys(creatorPerfData).map(k => {
      const [, streamer, site] = k.split('|');
      return (filterSite === 'All' || site === filterSite) ? streamer : null;
    }).filter(Boolean);
    return [...new Set([...fromData, ...fromPerf])].sort();
  }, [data, creatorPerfData, filterSite]);

  // Reset streamer filter when it no longer belongs to the selected site
  useEffect(() => {
    if (filterStreamer !== 'All' && !streamers.includes(filterStreamer)) {
      setFilterStreamer('All');
    }
  }, [streamers, filterStreamer]);

  const perfSites = Object.keys(creatorPerfData).map(k => k.split('|')[2]).filter(Boolean);
  const sites = [...new Set([...data.map(d => d.site), ...perfSites, 'COW', 'T2B'])].filter(s => s && s !== 'PP').sort();
  const types = ["Live", "Reels"];

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      
      {/* STICKY HEADER WRAPPER */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 md:px-8 space-y-2">
          
          <header className="flex flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3 flex-nowrap shrink-0">
              <h1 className="text-xl md:text-2xl font-bold text-indigo-900 tracking-tight whitespace-nowrap">Campaign Performance</h1>
              <button onClick={openAddModal} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                <Plus size={14} /> Add Entry
              </button>
              {!(activeView === 'report' && reportSubTab === 'creator') && (
              <button onClick={() => setShowImportModal(true)} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                <Upload size={14} /> Import CSV
              </button>
              )}
              <button onClick={handleDeduplicateData} className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                <CheckCircle size={14} /> Dedup
              </button>
            </div>
            
            <div className="flex gap-2 items-center flex-nowrap">
              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(d => !d)}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition-colors text-xs font-semibold shadow-sm"
              >
                {darkMode
                  ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                }
                {darkMode ? 'Light' : 'Dark'}
              </button>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartChange={setStartDate}
                onEndChange={setEndDate}
                minDate={minDate}
                maxDate={maxDate}
              />

              {!(activeView === 'report' && reportSubTab === 'creator') && (
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
              onClick={() => setActiveView('report')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeView === 'report' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <BarChart2 size={13}/> Report
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(() => {
              const isCreator = activeView === 'report' && reportSubTab === 'creator';
              const displaySpend = isCreator ? creatorSummary.spend : totals.spend;
              const displayDep   = isCreator ? creatorSummary.dep   : globalCreatorDep;
              const displayNGR   = isCreator ? creatorSummary.ngr   : globalCreatorNGR;
              const displayEff   = isCreator
                ? (creatorSummary.efficacyRate !== null && creatorSummary.efficacyRate !== undefined ? creatorSummary.efficacyRate : null)
                : globalEfficacyRate;
              return (<>
            <MetricCard
              title="Total Ad Spend"
              value={formatPHP(displaySpend)}
              icon={<ArrowDownRight className="text-red-500" size={16} />}
              color="border-l-4 border-red-500"
            />
            <MetricCard
              title="Total Deposit"
              value={formatPHP(displayDep)}
              icon={<ArrowUpRight className="text-emerald-500" size={16} />}
              color="border-l-4 border-emerald-500"
            />
            <MetricCard
              title="Total NGR"
              value={formatPHP(displayNGR)}
              icon={<DollarSign className={displayNGR >= 0 ? "text-indigo-500" : "text-red-500"} size={16} />}
              color={displayNGR >= 0 ? "border-l-4 border-indigo-500" : "border-l-4 border-red-500"}
              valueColor={displayNGR >= 0 ? 'text-emerald-600' : 'text-red-500'}
            />
            <MetricCard
              title="Efficacy Rate"
              value={displayEff !== null ? `${displayEff.toFixed(2)}%` : 'N/A'}
              icon={<TrendingUp className={displayEff !== null && displayEff >= 100 ? "text-emerald-600" : "text-amber-500"} size={16} />}
              subValue="NGR ÷ Ad Spend"
              color={displayEff !== null && displayEff >= 100 ? "border-l-4 border-emerald-600" : "border-l-4 border-amber-400"}
            />
              </>);
            })()}
          </div>
        </div>
      </div>

      {(!startDate || !endDate) && (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex flex-col items-center justify-center gap-4 py-24 bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <Calendar size={28} className="text-indigo-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Select a Date Range</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
              Use the <span className="font-semibold text-indigo-600 dark:text-indigo-400">date picker</span> in the top-right to choose a start and end date before viewing any data.
            </p>
          </div>
        </div>
      )}

      {startDate && endDate && activeView === 'dashboard' && (
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
                  <th className="p-4 font-semibold text-center">Lives</th>
                  <th className="p-4 font-semibold text-center">Reels</th>
                  <th className="p-4 font-semibold text-right">Ad Spend</th>
                  <th className="p-4 font-semibold text-right">Reg</th>
                  <th className="p-4 font-semibold text-right">Deposits</th>
                  <th className="p-4 font-semibold text-right">GGR</th>
                  <th className="p-4 font-semibold text-right">Bonus</th>
                  <th className="p-4 font-semibold text-right">NGR</th>
                  <th className="p-4 font-semibold text-right">Boosting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {streamerSummary.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{item.name}</td>
                    <td className="p-4 text-slate-500">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        item.site === 'WFL' ? 'bg-blue-100 text-blue-700' :
                        item.site === 'RLM' ? 'bg-purple-100 text-purple-700' :
                        item.site === 'COW' ? 'bg-teal-100 text-teal-700' :
                        item.site === 'T2B' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>{item.site}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-600">
                        <Radio size={14} className="text-red-500"/>{item.liveCount}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-600">
                        <Video size={14} className="text-blue-500"/>{item.reelsCount}
                      </div>
                    </td>
                    <td className="p-4 text-right text-red-500 font-medium">{formatPHP(item.spend)}</td>
                    <td className="p-4 text-right text-slate-600">{formatNum(item.reg)}</td>
                    <td className="p-4 text-right text-emerald-600 font-medium">{formatPHP(item.dep)}</td>
                    <td className={`p-4 text-right ${ item.ggr === 0 ? 'text-slate-300' : item.ggr >= 0 ? 'text-slate-700' : 'text-red-500'}`}>
                      {item.ggr === 0 ? '—' : new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(item.ggr)}
                    </td>
                    <td className={`p-4 text-right ${ item.bonus === 0 ? 'text-slate-300' : 'text-amber-600'}`}>
                      {item.bonus === 0 ? '—' : new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(item.bonus)}
                    </td>
                    <td className={`p-4 text-right font-semibold ${ item.ngr === 0 ? 'text-slate-300' : item.ngr >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {item.ngr === 0 ? '—' : new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(item.ngr)}
                    </td>
                    <td className={`p-4 text-right ${ item.boosting === 0 ? 'text-slate-300' : 'text-slate-600'}`}>
                      {item.boosting === 0 ? '—' : new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(item.boosting)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {streamerSummary.length > 0 && (() => {
                const gt = streamerSummary.reduce((acc, r) => ({
                  spend: acc.spend + r.spend, reg: acc.reg + r.reg, dep: acc.dep + r.dep,
                  ggr: acc.ggr + r.ggr, bonus: acc.bonus + r.bonus, ngr: acc.ngr + r.ngr, boosting: acc.boosting + r.boosting,
                  liveCount: acc.liveCount + r.liveCount, reelsCount: acc.reelsCount + r.reelsCount,
                }), { spend:0, reg:0, dep:0, ggr:0, bonus:0, ngr:0, boosting:0, liveCount:0, reelsCount:0 });
                return (
                  <tfoot>
                    <tr className="bg-slate-800 text-white text-sm font-bold">
                      <td className="p-4 uppercase tracking-wider" colSpan={2}>Grand Total</td>
                      <td className="p-4 text-center">{gt.liveCount}</td>
                      <td className="p-4 text-center">{gt.reelsCount}</td>
                      <td className="p-4 text-right">{formatPHP(gt.spend)}</td>
                      <td className="p-4 text-right">{formatNum(gt.reg)}</td>
                      <td className="p-4 text-right">{formatPHP(gt.dep)}</td>
                      <td className={`p-4 text-right ${gt.ggr >= 0 ? '' : 'text-red-300'}`}>{new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(gt.ggr)}</td>
                      <td className="p-4 text-right opacity-80">{new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(gt.bonus)}</td>
                      <td className={`p-4 text-right ${gt.ngr >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(gt.ngr)}</td>
                      <td className="p-4 text-right opacity-80">{new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(gt.boosting)}</td>
                    </tr>
                  </tfoot>
                );
              })()}
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
                  <th className="p-3 font-semibold">Status</th>
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
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        (item.status || 'Pending') === 'Success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        (item.status || 'Pending') === 'Failed'  ? 'bg-red-50 text-red-600 border-red-200' :
                        'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>{item.status || 'Pending'}</span>
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

      {startDate && endDate && activeView === 'report' && (
        <div className="max-w-7xl mx-auto px-4 pt-2 md:px-8">
          {/* Sub-tab bar */}
          <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit mb-6">
            <button
              onClick={() => setReportSubTab('ads')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                reportSubTab === 'ads' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <BarChart2 size={13}/> Ads Summary
            </button>
            <button
              onClick={() => setReportSubTab('creator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                reportSubTab === 'creator' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Activity size={13}/> Creator Report
            </button>
          </div>
        </div>
      )}

      {activeView === 'report' && reportSubTab === 'ads' && (
        <AdsReportView
          filteredData={filteredData}
          adsReportData={adsReportData}
          creatorPerfData={creatorPerfData}
          startDate={startDate}
          endDate={endDate}
          filterSite={filterSite}
          filterStreamer={filterStreamer}
          onEdit={openAdsEditModal}
          formatPHP={formatPHP}
          formatNum={formatNum}
        />
      )}

      {activeView === 'report' && reportSubTab === 'creator' && (
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
          onImportEOD={openEODImport}
          onAddEntry={(streamer, site) => {
            setEditingId(null);
            setFormValues({ ...emptyForm, date: new Date().toISOString().split('T')[0], streamer, site: (site && site !== 'All') ? site : 'WFL' });
            setShowModal(true);
          }}
          onEditEntry={openEditModal}
          onDeleteEntry={handleDelete}
          onDeleteDay={handleDeleteDay}
          noStreamData={noStreamData}
          onMarkNoStream={handleMarkNoStream}
          onUnmarkNoStream={handleUnmarkNoStream}
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
                    <option>Live</option><option>Reels</option>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Link (optional)</label>
                  <input type="text" value={formValues.link} onChange={e => setFormValues({...formValues, link: e.target.value})} placeholder="https://..." className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
                  <select value={formValues.status || 'Pending'} onChange={e => setFormValues({...formValues, status: e.target.value})} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option>Pending</option>
                    <option>Success</option>
                    <option>Failed</option>
                  </select>
                </div>
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

      {/* CSV IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && closeImportModal()}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Upload size={18} className="text-emerald-500"/> {importEODOnly ? 'Import EOD Report' : 'Import CSV'}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {importStep === 1 && (importEODOnly ? 'UNRAVEL EOD TALENTS files only' : 'Drop any CSV — format is detected automatically')}
                  {importStep === 2 && importMode === 'eod'      && `EOD Report detected — ${eodSections.length} streamer(s) found`}
                  {importStep === 2 && importMode === 'campaign' && `Campaign data — ${campPreview.length} rows ready`}
                  {importStep === 3 && 'Done!'}
                </p>
              </div>
              <button onClick={closeImportModal} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4">

              {/* STEP 1 — File Upload */}
              {importStep === 1 && (
                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                    importDragOver ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                  onClick={() => importFileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setImportDragOver(true); }}
                  onDragLeave={() => setImportDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setImportDragOver(false); handleImportFile(e.dataTransfer.files[0]); }}
                >
                  <Upload size={40} className="mx-auto text-slate-300 mb-3"/>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Click anywhere here or drag & drop a CSV file</p>
                  <p className="text-xs text-slate-400 mb-4">
                    {importEODOnly ? 'Only UNRAVEL EOD TALENTS CSV files are accepted here' : 'EOD reports and campaign CSVs are both supported'}
                  </p>
                  <input ref={importFileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={(e) => handleImportFile(e.target.files[0])}/>
                  <div className="flex justify-center gap-4 text-[11px] text-slate-400 mt-4">
                    {importEODOnly
                      ? <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full font-semibold">UNRAVEL EOD TALENTS - *.csv only</span>
                      : <><span className="bg-slate-100 px-3 py-1 rounded-full">UNRAVEL EOD TALENTS - *.csv</span><span className="bg-slate-100 px-3 py-1 rounded-full">MEDIA BUYER & TALENTS * TRACKER.csv</span></>
                    }
                  </div>
                </div>
              )}

              {/* STEP 2 — EOD Mode: Streamers review */}
              {importStep === 2 && importMode === 'eod' && (
                <div className="space-y-4">
                  {/* Site selector */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Site:</label>
                    <div className="flex gap-2">
                      {['WFL','RLM','T2B','COW'].map(s => (
                        <button
                          key={s}
                          onClick={() => setEodSite(s)}
                          className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                            eodSite === s
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-slate-200 text-slate-500 hover:border-indigo-300'
                          }`}
                        >{s}</button>
                      ))}
                    </div>
                    {!eodSite && <span className="text-xs text-amber-600 font-semibold">← please confirm the site</span>}
                  </div>

                  {/* Streamers table */}
                  {/* datalist of all known canonical streamer names for autocomplete */}
                  <datalist id="eod-streamer-names">
                    {[...new Set(Object.values(STREAMER_ALIASES))].sort().map(n => <option key={n} value={n}/>)}
                    {streamers.map(n => <option key={'k-'+n} value={n}/>)}
                  </datalist>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 w-8">
                            <input type="checkbox" checked={eodSections.every(s => s.selected)}
                              onChange={e => setEodSections(prev => prev.map(s => ({ ...s, selected: e.target.checked })))}
                              className="rounded"/>
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-500 uppercase tracking-wide">Streamer (from file)</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-500 uppercase tracking-wide">Import as</th>
                          <th className="px-3 py-2 text-center font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                          <th className="px-3 py-2 text-center font-semibold text-slate-500 uppercase tracking-wide">Rows</th>
                          <th className="px-3 py-2 text-center font-semibold text-slate-500 uppercase tracking-wide">Date range</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {eodSections.map((sec, i) => {
                          const dates = sec.rows.map(r => r.date).filter(Boolean).sort();
                          const dateRange = dates.length ? `${dates[0]} → ${dates[dates.length-1]}` : '—';
                          const isAutoMatched = sec.autoMatched;
                          return (
                            <tr key={i} className={sec.selected ? (isAutoMatched ? 'hover:bg-slate-50' : 'bg-amber-50/40 hover:bg-amber-50') : 'opacity-40'}>
                              <td className="px-3 py-2 text-center">
                                <input type="checkbox" checked={sec.selected}
                                  onChange={e => setEodSections(prev => prev.map((s,j) => j===i ? { ...s, selected: e.target.checked } : s))}
                                  className="rounded"/>
                              </td>
                              <td className="px-3 py-2 font-medium text-slate-500">{sec.streamer}</td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={sec.editName}
                                  list="eod-streamer-names"
                                  onChange={e => setEodSections(prev => prev.map((s,j) => j===i ? { ...s, editName: e.target.value, autoMatched: true } : s))}
                                  placeholder="Type streamer name…"
                                  className={`border rounded px-2 py-0.5 w-36 text-xs focus:outline-none focus:ring-1 ${
                                    isAutoMatched
                                      ? 'border-emerald-300 focus:ring-emerald-400'
                                      : 'border-amber-300 focus:ring-amber-400'
                                  }`}
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                {isAutoMatched
                                  ? <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full"><CheckCircle size={10}/> Matched</span>
                                  : <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full"><AlertTriangle size={10}/> Review</span>
                                }
                              </td>
                              <td className="px-3 py-2 text-center text-slate-500">{sec.rows.length}</td>
                              <td className="px-3 py-2 text-center text-slate-400 whitespace-nowrap">{dateRange}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {eodSections.some(s => s.selected && !s.autoMatched) && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
                      <AlertTriangle size={13} className="mt-0.5 shrink-0"/>
                      <span><strong>Review required:</strong> Some streamers could not be auto-identified. Type the correct name in the "Import as" field — it will auto-suggest known names.</span>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400">Data saves to Creator Performance (EOD) tab. Existing entries for the same date+streamer+site are overwritten.</p>
                </div>
              )}

              {/* STEP 2 — Campaign Mode: Column mapping + preview */}
              {importStep === 2 && importMode === 'campaign' && (() => {
                const campRequiredFields = ['date','site','streamer'];
                const campAllFields = ['date','site','streamer','spend','reg','dep','type','link'];
                const dupCheck = (e) => data.some(d =>
                  d.date === e.date && d.site === e.site && d.streamer === e.streamer && d.type === e.type
                );
                const dupCount = campPreview.filter(dupCheck).length;
                const newCount = campPreview.length - dupCount;
                return (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Column Mapping</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {campAllFields.map(field => (
                          <div key={field}>
                            <label className={`text-xs font-semibold uppercase tracking-wide ${
                              campRequiredFields.includes(field) ? 'text-indigo-600' : 'text-slate-400'
                            }`}>
                              {field} {campRequiredFields.includes(field) && <span className="text-red-400">*</span>}
                            </label>
                            {field === 'site' && campMapping._defaultSite && campMapping.site === undefined ? (
                              <div className="mt-1 w-full border border-emerald-200 rounded-lg px-2 py-1.5 text-xs bg-emerald-50 text-emerald-700 font-semibold">
                                Auto: {campMapping._defaultSite} (filename)
                              </div>
                            ) : (
                              <select
                                value={campMapping[field] ?? ''}
                                onChange={e => {
                                  const updated = { ...campMapping, [field]: e.target.value };
                                  setCampMapping(updated);
                                  setCampPreview(buildCampaignPreview(campRawRows, updated));
                                }}
                                className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                              >
                                <option value="">— skip —</option>
                                {campHeaders.map((h, idx) => (
                                  <option key={idx} value={String(idx)}>{h || `Column ${idx+1}`}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="bg-emerald-50 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg">{newCount} new rows</span>
                      {dupCount > 0 && <span className="bg-amber-50 text-amber-700 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"><AlertTriangle size={12}/> {dupCount} duplicates</span>}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preview ({campPreview.length} rows)</h3>
                      <div className="overflow-x-auto max-h-48 rounded-lg border border-slate-200">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50 sticky top-0">
                            <tr>
                              {['date','site','streamer','spend','reg','dep','type'].map(f => (
                                <th key={f} className="px-3 py-2 text-left font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{f}</th>
                              ))}
                              <th className="px-3 py-2 text-center font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {campPreview.map((row, i) => {
                              const dup = dupCheck(row);
                              return (
                                <tr key={i} className={dup ? 'bg-amber-50' : 'hover:bg-slate-50'}>
                                  <td className="px-3 py-1.5 whitespace-nowrap">{row.date}</td>
                                  <td className="px-3 py-1.5">{row.site}</td>
                                  <td className="px-3 py-1.5">{row.streamer}</td>
                                  <td className="px-3 py-1.5 text-right">{row.spend?.toLocaleString()}</td>
                                  <td className="px-3 py-1.5 text-right">{row.reg}</td>
                                  <td className="px-3 py-1.5 text-right">{row.dep?.toLocaleString()}</td>
                                  <td className="px-3 py-1.5">{row.type}</td>
                                  <td className="px-3 py-1.5 text-center">
                                    {dup ? <span className="text-amber-600 font-semibold">Duplicate</span> : <span className="text-emerald-600 font-semibold">New</span>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* STEP 3 — Result */}
              {importStep === 3 && importResult && (
                <div className="text-center py-10">
                  <CheckCircle size={52} className="mx-auto text-emerald-500 mb-4"/>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {importResult.mode === 'eod' ? 'EOD Data Imported!' : 'Campaign Data Imported!'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    <span className="font-bold text-emerald-600">{importResult.imported} {importResult.mode === 'eod' ? 'day-entries' : 'rows'}</span> saved successfully.
                    {importResult.skipped > 0 && <> <span className="font-bold text-amber-600">{importResult.skipped} duplicates</span> skipped.</>}
                  </p>
                  {importResult.mode === 'eod' && (
                    <p className="text-xs text-slate-400 mt-2">View results in the Creator Performance tab.</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center gap-3">
              {importStep === 1 && (
                <>
                  <span className="text-xs text-slate-400">Supports .csv and .tsv files</span>
                  <button onClick={closeImportModal} className="border border-slate-200 text-slate-600 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                </>
              )}
              {importStep === 2 && importMode === 'eod' && (
                <>
                  <button onClick={() => setImportStep(1)} className="border border-slate-200 text-slate-600 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-slate-50">← Back</button>
                  <button
                    onClick={handleEODImport}
                    disabled={!eodSite || eodSections.every(s => !s.selected)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-5 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Upload size={14}/> Import EOD Data ({eodSections.filter(s=>s.selected).reduce((a,s)=>a+s.rows.length,0)} entries)
                  </button>
                </>
              )}
              {importStep === 2 && importMode === 'campaign' && (() => {
                const campRequiredFields = ['date','site','streamer'];
                const dupCount = campPreview.filter(e => data.some(d =>
                  d.date === e.date && d.site === e.site && d.streamer === e.streamer && d.type === e.type
                )).length;
                const missingRequired = campRequiredFields.some(f => {
                  if (f === 'site' && campMapping._defaultSite) return false;
                  return !campMapping[f];
                });
                return (
                  <>
                    <button onClick={() => setImportStep(1)} className="border border-slate-200 text-slate-600 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-slate-50">← Back</button>
                    <div className="flex gap-2">
                      {dupCount > 0 && (
                        <button
                          onClick={() => handleCampaignImport(true)}
                          disabled={missingRequired}
                          className="flex items-center gap-1.5 border border-amber-400 text-amber-700 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <AlertTriangle size={14}/> Skip Duplicates ({campPreview.length - dupCount})
                        </button>
                      )}
                      <button
                        onClick={() => handleCampaignImport(false)}
                        disabled={missingRequired || campPreview.length === 0}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Upload size={14}/> Import All ({campPreview.length})
                      </button>
                    </div>
                  </>
                );
              })()}
              {importStep === 3 && (
                <>
                  <span/>
                  <button onClick={closeImportModal} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg text-sm transition-colors">Done</button>
                </>
              )}
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
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
                <div className="mt-1 flex gap-2">
                  {['Pending', 'Success', 'Failed'].map(s => (
                    <button
                      key={s}
                      onClick={() => setCreatorPerfFormValues({...creatorPerfFormValues, status: s})}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                        (creatorPerfFormValues.status || 'Pending') === s
                          ? s === 'Success' ? 'bg-emerald-500 text-white border-emerald-500'
                            : s === 'Failed' ? 'bg-red-500 text-white border-red-500'
                            : 'bg-amber-400 text-white border-amber-400'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >{s}</button>
                  ))}
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

function MetricCard({ title, value, subValue, icon, color, valueColor }) {
  return (
    <div className={`bg-white p-3 rounded-xl shadow-sm border-t border-r border-b border-slate-200 ${color} flex flex-col justify-between`}>
      <div className="flex justify-between items-start mb-1">
        <span className="text-slate-500 text-xs font-bold uppercase tracking-wide truncate pr-2">{title}</span>
        <div className="p-1.5 bg-slate-50 rounded-md scale-90">{icon}</div>
      </div>
      <div>
        <div className={`text-lg md:text-xl font-bold leading-tight ${valueColor || 'text-slate-900'}`}>{value}</div>
        {subValue && <div className="text-[10px] font-medium text-slate-400">{subValue}</div>}
      </div>
    </div>
  );
}

function AdsReportView({ filteredData, adsReportData, creatorPerfData, startDate, endDate, filterSite, filterStreamer, onEdit, formatNum }) {
  // Group from campaign entries: site → streamer → type → { reg, dep }
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

  // Also merge EOD creatorPerfData: adds sites/streamers missing from campaign data,
  // and provides GGR/Bonus/NGR directly from the EOD reports.
  Object.entries(creatorPerfData || {}).forEach(([key, perf]) => {
    const [date, streamer, site] = key.split('|');
    if (!date || !streamer || !site) return;
    if (startDate && date < startDate) return;
    if (endDate && date > endDate) return;
    if (filterSite && filterSite !== 'All' && site !== filterSite) return;
    if (filterStreamer && filterStreamer !== 'All' && streamer !== filterStreamer) return;
    if (!grouped[site]) grouped[site] = {};
    if (!grouped[site][streamer]) grouped[site][streamer] = { Live: { reg: 0, dep: 0 }, Reels: { reg: 0, dep: 0 } };
    if (!grouped[site][streamer]._perf) grouped[site][streamer]._perf = { reg: 0, dep: 0, ggr: 0, bonus: 0, ngr: 0 };
    grouped[site][streamer]._perf.reg   += perf.reg   || 0;
    grouped[site][streamer]._perf.dep   += perf.dep   || 0;
    grouped[site][streamer]._perf.ggr   += perf.ggr   || 0;
    grouped[site][streamer]._perf.bonus += perf.bonus || 0;
    grouped[site][streamer]._perf.ngr   += perf.ngr   || 0;
  });

  const SITE_LABELS = { WFL: 'WINFORLIFE', RLM: 'ROLLEM', COW: 'COW', T2B: 'T2B' };
  const getAds = (site, streamer, type) => adsReportData[`${site}|${streamer}|${type}`] || { ggr: 0, bonus: 0, ngr: 0, boosting: 0 };

  const fmtVal = (val) => {
    const n = parseFloat(val) || 0;
    if (n === 0) return '0';
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  };

  // All sites that have any data (campaign or EOD)
  const siteOrder = ['WFL', 'RLM', 'COW', 'T2B'].filter(s => grouped[s]);

  // Pre-compute aggregates
  const siteData = siteOrder.map(site => {
    const streamers = Object.keys(grouped[site]).sort((a, b) => {
      const regA = grouped[site][a].Live.reg + grouped[site][a].Reels.reg + (grouped[site][a]._perf?.reg || 0);
      const regB = grouped[site][b].Live.reg + grouped[site][b].Reels.reg + (grouped[site][b]._perf?.reg || 0);
      return regB - regA;
    });
    const streamerData = streamers.map(streamer => {
      const liveStats  = grouped[site][streamer].Live;
      const reelsStats = grouped[site][streamer].Reels;
      const perf       = grouped[site][streamer]._perf || { reg: 0, dep: 0, ggr: 0, bonus: 0, ngr: 0 };
      const liveAds    = getAds(site, streamer, 'Live');
      const reelsAds   = getAds(site, streamer, 'Reels');

      // reg/dep: use campaign entries when present, otherwise fall back to EOD perf totals
      const campReg = liveStats.reg + reelsStats.reg;
      const campDep = liveStats.dep + reelsStats.dep;
      const totalReg = campReg > 0 ? campReg : perf.reg;
      const totalDep = campDep > 0 ? campDep : perf.dep;

      // GGR/Bonus/NGR: prefer manually entered adsReportData, then EOD perf totals
      const manualGGR   = liveAds.ggr + reelsAds.ggr;
      const manualBonus = liveAds.bonus + reelsAds.bonus;
      const manualNGR   = liveAds.ngr + reelsAds.ngr;
      const totalGGR    = manualGGR   !== 0 ? manualGGR   : perf.ggr;
      const totalBonus  = manualBonus !== 0 ? manualBonus : perf.bonus;
      const totalNGR    = manualNGR   !== 0 ? manualNGR   : perf.ngr;
      const totalBoosting = liveAds.boosting + reelsAds.boosting;

      // Decide whether to show Live/Reels rows or a single EOD row
      const hasLive   = liveStats.reg > 0 || liveStats.dep > 0;
      const hasReels  = reelsStats.reg > 0 || reelsStats.dep > 0;
      const hasEODOnly = !hasLive && !hasReels && perf.reg > 0;

      return {
        streamer, liveStats, reelsStats, liveAds, reelsAds,
        perf, hasLive, hasReels, hasEODOnly,
        totalReg, totalDep, totalGGR, totalBonus, totalNGR, totalBoosting,
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
      {siteData.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-4">📊</div>
          <p className="font-semibold text-slate-500 text-lg mb-1">No data to display</p>
          <p className="text-sm">Import an EOD report or campaign CSV to see the Ads Report.</p>
        </div>
      )}
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
            {streamerData.map(({ streamer, liveStats, reelsStats, liveAds, reelsAds, perf, hasLive, hasReels, hasEODOnly, totalReg, totalDep, totalGGR, totalBonus, totalNGR, totalBoosting }) => {
              const lbl = streamer.toUpperCase();
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
                        {/* EOD-only row: shown when no campaign entries exist but EOD data does */}
                        {hasEODOnly && (
                          <tr className="hover:bg-sky-50/30 transition-colors">
                            <td className="px-4 py-2.5 font-medium text-slate-700">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-sky-400 inline-block"></span>EOD Data
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right text-slate-600">{formatNum(perf.reg)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-600">{fmtVal(perf.dep)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-500">{fmtVal(perf.ggr)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-500">{fmtVal(perf.bonus)}</td>
                            <td className={`px-4 py-2.5 text-right font-medium ${perf.ngr >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtVal(perf.ngr)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-400">—</td>
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
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-1.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest w-44"></th>
                      <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded">Reg</span></th>
                      <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded">Deposits</span></th>
                      <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">GGR</span></th>
                      <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">Bonus</span></th>
                      <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-teal-100 text-teal-600 px-1.5 py-0.5 rounded">NGR</span></th>
                      <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded">Boosting</span></th>
                    </tr>
                  </thead>
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
              <thead>
                <tr className="border-b border-indigo-700">
                  <th className="px-4 py-1.5 text-left text-[10px] font-semibold text-indigo-300 uppercase tracking-widest w-44"></th>
                  <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-sky-900/60 text-sky-300 px-1.5 py-0.5 rounded">Reg</span></th>
                  <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded">Deposits</span></th>
                  <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-amber-900/60 text-amber-300 px-1.5 py-0.5 rounded">GGR</span></th>
                  <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-orange-900/60 text-orange-300 px-1.5 py-0.5 rounded">Bonus</span></th>
                  <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-teal-900/60 text-teal-300 px-1.5 py-0.5 rounded">NGR</span></th>
                  <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-violet-900/60 text-violet-300 px-1.5 py-0.5 rounded">Boosting</span></th>
                </tr>
              </thead>
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
function CreatorReportView({ data, startDate, endDate, creatorPerfData, onEdit, onSummaryChange, formatPHP, streamers, sites, onAddEntry, onEditEntry, onDeleteEntry, onDeleteDay, noStreamData, onMarkNoStream, onUnmarkNoStream, onImportEOD }) {
  const [selectedStreamer, setSelectedStreamer] = React.useState(streamers[0] || '');
  const [selectedSite, setSelectedSite] = React.useState('All');

  // Derive streamers scoped to the selected site
  const siteFilteredStreamers = React.useMemo(() => {
    if (selectedSite === 'All') return streamers;
    const fromData = [...new Set(data.filter(d => d.site === selectedSite).map(d => d.streamer))].filter(Boolean);
    const fromPerf = [...new Set(
      Object.keys(creatorPerfData)
        .filter(k => k.split('|')[2] === selectedSite)
        .map(k => k.split('|')[1])
    )].filter(Boolean);
    return [...new Set([...fromData, ...fromPerf])].sort();
  }, [selectedSite, data, creatorPerfData, streamers]);

  // Auto-select first streamer when list becomes available or site changes
  React.useEffect(() => {
    if (siteFilteredStreamers.length > 0 && !siteFilteredStreamers.includes(selectedStreamer)) {
      setSelectedStreamer(siteFilteredStreamers[0]);
    }
  }, [siteFilteredStreamers]);
  const [expandedRow, setExpandedRow] = React.useState(null);
  const [noStreamDateInput, setNoStreamDateInput] = React.useState('');
  const [nsOpen, setNsOpen] = React.useState(false);
  const nsRef = React.useRef(null);

  React.useEffect(() => {
    if (!nsOpen) return;
    const h = (e) => { if (nsRef.current && !nsRef.current.contains(e.target)) setNsOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [nsOpen]);

  // Filter data for the selected creator
  const creatorEntries = data.filter(d =>
    d.streamer === selectedStreamer &&
    (!startDate || d.date >= startDate) &&
    (!endDate   || d.date <= endDate) &&
    (selectedSite === 'All' || d.site === selectedSite)
  );

  // Get dates from campaign entries AND from creatorPerfData (so EOD-only days show up too)
  const perfDates = Object.keys(creatorPerfData)
    .filter(key => {
      const [date, streamer, site] = key.split('|');
      return streamer === selectedStreamer &&
        (!startDate || date >= startDate) &&
        (!endDate   || date <= endDate) &&
        (selectedSite === 'All' || site === selectedSite);
    })
    .map(key => key.split('|')[0]);

  const creatorDates = [...new Set([...creatorEntries.map(d => d.date), ...perfDates])].sort();

  // Get manually-marked no-stream keys for this streamer in the selected site + date range
  const noStreamRows = Object.keys(noStreamData)
    .filter(key => {
      const [date, streamer, site] = key.split('|');
      return streamer === selectedStreamer &&
        (!startDate || date >= startDate) &&
        (!endDate   || date <= endDate) &&
        (selectedSite === 'All' || site === selectedSite);
    })
    .map(key => {
      const [date, , site] = key.split('|');
      return { date, siteName: site, noStream: true, key };
    });

  // Auto-detect no-stream dates: any date between the streamer's first and last entry
  // (within the selected date range) that has no campaign data AND no EOD perf entry.
  // Build per-day rows (include dayEntries for inline editing)
  const entryRows = creatorDates.map(date => {
    const dayEntries = creatorEntries.filter(e => e.date === date);
    const totalSpend = dayEntries.reduce((s, e) => s + e.spend, 0);
    // Use site from campaign entry if available, otherwise find from creatorPerfData
    let siteName = dayEntries[0]?.site || '';
    if (!siteName && selectedSite !== 'All') siteName = selectedSite;
    if (!siteName) {
      const perfKey = Object.keys(creatorPerfData).find(k => k.startsWith(`${date}|${selectedStreamer}|`));
      if (perfKey) siteName = perfKey.split('|')[2];
    }
    const key = `${date}|${selectedStreamer}|${siteName}`;
    const perf = creatorPerfData[key] || { ggr: 0, bonus: 0, ngr: 0, activePl: 0, validTurnover: 0, totalWithdrawal: 0, reg: 0, dep: 0 };
    // Always prefer EOD perf data for reg/dep (authoritative source); campaign entries carry 0 as placeholders
    const campaignReg = dayEntries.reduce((s, e) => s + e.reg, 0);
    const campaignDep = dayEntries.reduce((s, e) => s + e.dep, 0);
    const totalReg = (perf.reg != null && perf.reg > 0) ? perf.reg : campaignReg;
    const totalDep = (perf.dep != null && perf.dep > 0) ? perf.dep : campaignDep;
    const efficacyRate = totalSpend > 0 ? (perf.ngr / totalSpend) * 100 : null;
    return { date, siteName, totalSpend, totalDep, totalReg, ...perf, efficacyRate, key, dayEntries, noStream: false };
  });

  // Merge and sort all rows by date (manual no-stream + data rows)
  const rows = [...entryRows, ...noStreamRows].sort((a, b) => a.date.localeCompare(b.date));

  // Totals (exclude no-stream rows)
  const totals = rows.filter(r => !r.noStream).reduce((acc, r) => ({
    spend: acc.spend + r.totalSpend,
    dep: acc.dep + r.totalDep,
    reg: acc.reg + r.totalReg,
    ggr: acc.ggr + (r.ggr || 0),
    bonus: acc.bonus + (r.bonus || 0),
    ngr: acc.ngr + (r.ngr || 0),
    activePl: acc.activePl + (r.activePl || 0),
    validTurnover: parseFloat((acc.validTurnover + (r.validTurnover || 0)).toFixed(2)),
    totalWithdrawal: parseFloat((acc.totalWithdrawal + (r.totalWithdrawal || 0)).toFixed(2)),
  }), { spend: 0, dep: 0, reg: 0, ggr: 0, bonus: 0, ngr: 0, activePl: 0, validTurnover: 0, totalWithdrawal: 0 });

  const totalEfficacy = totals.spend > 0 ? (totals.ngr / totals.spend) * 100 : null;

  // Grand totals across ALL streamers (for the header summary cards)
  const allTotals = React.useMemo(() => {
    const filtered = data.filter(d =>
      (!startDate || d.date >= startDate) &&
      (!endDate   || d.date <= endDate)
    );
    const allSpend = filtered.reduce((s, e) => s + e.spend, 0);
    const campaignDep = filtered.reduce((s, e) => s + e.dep, 0);
    let perfDep = 0, perfNGR = 0;
    Object.entries(creatorPerfData).forEach(([key, perf]) => {
      const [date] = key.split('|');
      if ((!startDate || date >= startDate) && (!endDate || date <= endDate)) {
        perfDep  += perf.dep || 0;
        perfNGR  += perf.ngr || 0;
      }
    });
    const allDep = perfDep > 0 ? perfDep : campaignDep;
    const allNGR = perfNGR;
    const allEfficacy = allSpend > 0 ? (allNGR / allSpend) * 100 : null;
    return { spend: allSpend, dep: allDep, ngr: allNGR, efficacyRate: allEfficacy };
  }, [data, creatorPerfData, startDate, endDate]);

  // Lift summary up to header
  React.useEffect(() => {
    onSummaryChange(allTotals);
  }, [allTotals.spend, allTotals.dep, allTotals.ngr, allTotals.efficacyRate]);

  // Index of the last actual (non-noStream) row for PENDING badge
  const lastEntryIdx = rows.reduce((last, r, i) => (!r.noStream ? i : last), -1);

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

  const siteColors = { WFL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', RLM: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', COW: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300', T2B: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' };

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
            {siteFilteredStreamers.map(s => <option key={s} value={s}>{s}</option>)}
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
        <button
          onClick={onImportEOD}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <Upload size={15}/> Import EOD
        </button>
        {/* No Stream — popover */}
        <div className="relative" ref={nsRef}>
          <button
            onClick={() => setNsOpen(o => !o)}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all border ${nsOpen ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-amber-600 border-amber-300 hover:bg-amber-50 hover:border-amber-400'}`}
          >
            <X size={14}/> Mark No Stream
          </button>
          {nsOpen && (
            <div className="absolute left-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-72">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Mark a day as No Stream</p>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">Select the date when <span className="font-semibold text-slate-600">{selectedStreamer}</span> did not stream.</p>
              <input
                type="date"
                value={noStreamDateInput}
                min={startDate}
                max={endDate}
                onChange={e => setNoStreamDateInput(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!noStreamDateInput) return;
                    const site = selectedSite !== 'All' ? selectedSite : (data.find(d => d.streamer === selectedStreamer)?.site || 'WFL');
                    onMarkNoStream(noStreamDateInput, selectedStreamer, site);
                    setNoStreamDateInput('');
                    setNsOpen(false);
                  }}
                  disabled={!noStreamDateInput}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                >
                  <X size={13}/> Confirm
                </button>
                <button
                  onClick={() => { setNsOpen(false); setNoStreamDateInput(''); }}
                  className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 transition-colors font-medium"
                >Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
          <span className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">{selectedStreamer}</span>
          <span className="text-sm text-slate-400 dark:text-slate-500 font-medium">: End of Day Performance</span>
          <div className="text-xs text-slate-400 dark:text-slate-500 ml-auto">{rows.length} day{rows.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="overflow-auto max-h-[70vh]">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-green-900 text-white text-xs uppercase tracking-wider sticky top-0 z-10">
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
                <th className="px-2 py-2 text-center font-semibold">Status</th>
                <th className="px-2 py-2 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={13} className="px-4 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                    No data for <strong>{selectedStreamer}</strong> in the selected date range. Use <span className="text-amber-600 dark:text-amber-400 font-semibold">Mark No Stream</span> to record days with no activity.
                  </td>
                </tr>
              )}
              {rows.map((row, idx) => (
                <React.Fragment key={idx}>
                  {row.noStream ? (
                    <tr className="bg-slate-100/80 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 italic">
                      <td className="px-2 py-2 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">{fmtDate(row.date)}</td>
                      <td className="px-2 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${siteColors[row.siteName] || 'bg-gray-100 text-gray-600'}`}>{row.siteName}</span>
                      </td>
                      <td colSpan={9} className="px-2 py-2 text-center">
                        <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs font-semibold tracking-wider">
                          <X size={11} className="text-slate-400 dark:text-slate-500"/> NO STREAM
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600">NO STREAM</span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          onClick={() => onUnmarkNoStream(row.key)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Remove no-stream marker"
                        >
                          <Trash2 size={12}/>
                        </button>
                      </td>
                    </tr>
                  ) : (
                  <>
                  <tr className={`hover:bg-green-50/40 dark:hover:bg-green-900/20 transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-slate-50/30 dark:bg-slate-800/20'}`}>
                    <td className="px-2 py-2 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{fmtDate(row.date)}</td>
                    <td className="px-2 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${siteColors[row.siteName] || 'bg-gray-100 text-gray-600'}`}>{row.siteName}</span>
                    </td>
                    <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-400">{row.totalReg}</td>
                    <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-400">{row.activePl ? row.activePl.toLocaleString() : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                    <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-400">{row.validTurnover ? row.validTurnover.toLocaleString() : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                    <td className="px-2 py-2 text-right text-red-500 font-medium">{formatPHP(row.totalSpend)}</td>
                    <td className="px-2 py-2 text-right text-emerald-600 font-medium">{formatPHP(row.totalDep)}</td>
                    <td className="px-2 py-2 text-right text-red-400">{row.totalWithdrawal ? `-${row.totalWithdrawal.toLocaleString()}` : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                    <td className={`px-2 py-2 text-right ${(row.ggr || 0) >= 0 ? 'text-slate-600 dark:text-slate-400' : 'text-red-500'}`}>{fmtVal(row.ggr)}</td>
                    <td className="px-2 py-2 text-right text-amber-600">{fmtVal(row.bonus)}</td>
                    <td className={`px-2 py-2 text-right ${(row.ngr || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtVal(row.ngr)}</td>
                    <td className="px-2 py-2 text-center">
                      {(() => {
                        const s = row.status != null ? row.status : (idx === lastEntryIdx ? 'Pending' : 'Success');
                        const cls = s === 'Success' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700'
                          : s === 'Failed' ? 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
                          : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700';
                        return <span className={`px-1.5 py-0.5 rounded text-xs font-bold border ${cls}`}>{s.toUpperCase()}</span>;
                      })()}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                      {/* Edit GGR/Bonus/NGR */}
                      <button
                        onClick={() => onEdit(row.date, selectedStreamer, row.siteName)}
                        className="p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                        title="Edit GGR / Bonus / NGR"
                      >
                        <Edit2 size={12}/>
                      </button>
                      {/* Delete all entries for this day */}
                      <button
                        onClick={() => onDeleteDay(row.dayEntries)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete all entries for this day"
                      >
                        <Trash2 size={12}/>
                      </button>
                      </div>
                    </td>
                  </tr>
                  {/* Inline entries sub-row */}
                  {expandedRow === row.date && (
                    <tr className="bg-indigo-50/60 dark:bg-indigo-900/15">
                      <td colSpan={13} className="px-6 py-3">
                        <div className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-2">Campaign Entries — {fmtDate(row.date)}</div>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-slate-500 dark:text-slate-400 border-b border-indigo-100 dark:border-indigo-800">
                              <th className="py-1 text-left font-semibold">Type</th>
                              <th className="py-1 text-right font-semibold">Spend</th>
                              <th className="py-1 text-right font-semibold">Reg</th>
                              <th className="py-1 text-right font-semibold">Deposit</th>
                              <th className="py-1 text-center font-semibold w-16"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {row.dayEntries.map((entry, ei) => (
                              <tr key={ei} className="border-b border-indigo-50 dark:border-indigo-900/40 last:border-0">
                                <td className="py-1.5 text-slate-600 dark:text-slate-400">{entry.type}</td>
                                <td className="py-1.5 text-right text-red-500">{formatPHP(entry.spend)}</td>
                                <td className="py-1.5 text-right text-slate-600 dark:text-slate-400">{entry.reg}</td>
                                <td className="py-1.5 text-right text-emerald-600">{formatPHP(entry.dep)}</td>
                                <td className="py-1.5 text-center flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => onEditEntry(entry)}
                                    className="p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded transition-colors"
                                    title="Edit entry"
                                  >
                                    <Edit2 size={11}/>
                                  </button>
                                  <button
                                    onClick={() => onDeleteEntry(entry)}
                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
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
                          className="mt-2 flex items-center gap-1 text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
                        >
                          <Plus size={11}/> Add entry for this day
                        </button>
                      </td>
                    </tr>
                  )}
                  </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="bg-green-900 dark:bg-green-950 text-white font-bold text-sm">
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
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Efficacy Rate</span> = NGR ÷ Ad Spend × 100 &nbsp;·&nbsp; Click the edit button per row to enter GGR, Bonus & NGR
            </p>
          </div>
        )}
      </div>
    </div>
  );
}