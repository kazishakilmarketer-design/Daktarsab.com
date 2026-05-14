import { motion } from "framer-motion";
import { ShieldCheck, Lock, AlertTriangle, MapPin, Phone, Mail, FileText, Zap, HeartHandshake, Info } from "lucide-react";

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-slate-50/50 pt-6 pb-20 md:pt-10 md:pb-24 antialiased">
            <div className="mx-auto max-w-4xl px-4 md:px-8">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center"
                >
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden p-2">
                        <img src="/doctor-saab-icon.png" alt="Doctor Saab Logo" className="h-full w-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">ডাক্তার সাব</h1>
                    <p className="mt-3 text-sm font-medium text-slate-500 md:text-base">আপনার ডিজিটাল স্বাস্থ্যসেবা সঙ্গী</p>
                </motion.div>

                <div className="space-y-8">

                    {/* Section 1: About Us (আমাদের কথা) */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm drop-shadow-sm md:p-10"
                    >
                        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                            <HeartHandshake className="h-6 w-6 text-emerald-500" />
                            <h2 className="text-xl font-bold text-slate-800 md:text-2xl">আমাদের কথা</h2>
                        </div>

                        <div className="space-y-5 text-sm leading-relaxed text-slate-600 md:text-base md:leading-loose">
                            <p>
                                গল্পটা শুরু হয়েছিল এক হারানো শৈশব থেকে... ব্রাহ্মণবাড়িয়ার নবীনগর থানার কনিকারা গ্রামে। চৌধুরী বাড়ির আঙিনায় একজন মানুষ বিনা পয়সায় মানুষের সেবা করতেন—আমার নানাভাই। তিনি চলে গেলেন, কিন্তু রেখে গেলেন এক অদৃশ্য উত্তরাধিকার। মানুষ বাঁচে তার স্মৃতিতে, আর সুস্থ থাকে ভরসায়।
                            </p>

                            <blockquote className="my-6 border-l-4 border-emerald-500 bg-emerald-50 py-4 pl-5 italic text-emerald-800 rounded-r-xl">
                                নানাভাই হাবিবুর রহমান চৌধুরী বলতেন, <span className="font-bold">"সেবাই মানুষের শ্রেষ্ঠ পরিচয়।"</span>
                            </blockquote>

                            <p>
                                অব্যবস্থাপনা আর দুর্নীতির জং ধরা স্বাস্থ্য ব্যবস্থাকে যখন সাধারণ জনগণ ভয় পেত, তখন কনিকারা গ্রামের সেই সহজ-সরল জাকিয়া পাগলী ও নানার সময়কার কিছু বৃদ্ধের আদর করে আমাকে ডাকা "ডাক্টারসাব" নামটা মনে পড়ে। ওনার সেই আদর্শ আর আধুনিক বিজ্ঞানের এক মায়াবী মেলবন্ধন হলো <strong>'ডাক্তার সাব'</strong>।
                            </p>
                            <p>
                                মাঝরাতে অসুস্থ মায়ের জন্য যখন একটা অ্যাম্বুলেন্স খুঁজে পাওয়া যায় না, কিংবা কোন ডাক্তারের কাছে যাবেন তা না বুঝে যখন দালালের খপ্পরে পড়ে সর্বস্বান্ত হতে হয়—সেই অসহায়ত্ব আমরা চিনি। প্রত্যন্ত অঞ্চল থেকে শুরু করে সারা বাংলাদেশের ১৬২০ জন বিশেষজ্ঞ ডাক্তার, কমিউনিটি ক্লিনিক থেকে প্রিমিয়াম হসপিটাল সহ ব্লাড ব্যাংক ও এম্বুলেন্স এর ডাটাবেস আমরা তৈরি করছি শুধু একটি লক্ষেই—যাতে সঠিক তথ্যের অভাবে কোনো প্রাণ অকালে ঝরে না যায়। আমরা কেবল একটি এআই প্ল্যাটফর্ম নই; আমরা প্রতিটি মানুষের অসুস্থতার দিনে এক টুকরো ছায়া হতে চাই।
                            </p>
                        </div>

                        <div className="mt-10 grid gap-6 md:grid-cols-2">
                            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                                <h3 className="mb-3 flex items-center gap-2 font-bold text-blue-800">
                                    <span>🎯</span> আমাদের লক্ষ্য (Mission)
                                </h3>
                                <p className="text-sm text-blue-900/80 leading-relaxed">
                                    অব্যবস্থাপনা আর দুর্নীতির জং ধরা স্বাস্থ্য ব্যবস্থাকে উপড়ে ফেলে আমরা এক নতুন ভোরের স্বপ্ন দেখি। আমাদের লক্ষ্য হলো ডিজিটালাইজেশনের মাধ্যমে বাংলাদেশের প্রতিটি মানুষের জন্য বিনামূল্যে প্রাথমিক চিকিৎসা সেবা এবং দ্রুত ও সাশ্রয়ী স্বাস্থ্যসেবা নিশ্চিত করা।
                                </p>
                            </div>
                            <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5">
                                <h3 className="mb-3 flex items-center gap-2 font-bold text-red-800">
                                    <span>⛈️</span> সমস্যা যখন পাহাড় সমান
                                </h3>
                                <ul className="space-y-2 text-sm text-red-900/80 leading-relaxed">
                                    <li><strong>তথ্যের গোলকধাঁধা:</strong> জরুরি সময়ে মানুষ বুঝতে পারে না কোথায় যাবে, কার কাছে যাবে।</li>
                                    <li><strong>ভুল বিশেষজ্ঞ:</strong> সাধারণ পেটে ব্যথার জন্য ভুল দরজায় কড়া নেড়ে সময় এবং টাকা—দুটোই নষ্ট হয়।</li>
                                    <li><strong>দালাল রাজত্ব:</strong> সঠিক তথ্যের অভাবে সাধারণ মানুষ অসাধু চক্রের শিকার হয়ে অতিরিক্ত খরচ করতে বাধ্য হয়।</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6">
                            <h3 className="mb-4 flex items-center gap-2 font-bold text-emerald-800 text-lg">
                                <span>✨</span> সমাধান: আপনার হাতের মুঠোয় 'ডাক্তার সাব'
                            </h3>
                            <p className="mb-4 text-sm text-slate-700 leading-relaxed">
                                আমরা প্রযুক্তির ভাষায় কথা বলি না, আমরা কথা বলি প্রাণের ভাষায়। আমাদের এআই সিস্টেম আপনার জন্য যা করবে:
                            </p>
                            <ul className="grid gap-3 sm:grid-cols-2">
                                {[
                                    "AI সিম্পটম গাইড: আপনার সমস্যার কথা খুলে বলুন, আমাদের ট্রায়াজ এজেন্ট বলে দেবে আপনার ঠিক কোন বিশেষজ্ঞের পরামর্শ প্রয়োজন।",
                                    "নিকটস্থ হাসপাতাল: বিপদের মুহূর্তে আপনার সবচেয়ে কাছের হাসপাতাল বা ডায়াগনস্টিক সেন্টারের হদিস মিলবে এক পলকেই।",
                                    "সরাসরি বুকিং ও ওয়ান ট্যাপ কল: কোনো মধ্যস্বত্বভোগী নেই। এক ক্লিকেই সরাসরি ডাক্তার বা অ্যাম্বুলেন্সের সাথে যোগাযোগ।",
                                    "সাশ্রয়ী ও স্বচ্ছ: সঠিক তথ্যের মাধ্যমে আমরা আপনার অপ্রয়োজনীয় খরচ কমিয়ে আনি।"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                        <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-6">
                            <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
                                <span>⚙️</span> আমরা যেভাবে কাজ করি
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                'ডাক্তার সাব' একটি অদৃশ্য সুতোর মতো। একদিকে আমাদের বিশাল ডাটাবেস, আর অন্যদিকে আপনার প্রয়োজন। আপনি যখন আপনার সমস্যার কথা আমাদের জানান, আমাদের এআই আপনার উপসর্গগুলো বিশ্লেষণ করে দ্রুততম সময়ে আপনাকে সঠিক গন্তব্য দেখিয়ে দেয়। এখানে কোডিংয়ের আড়ালে কাজ করে গভীর মমতা।
                            </p>
                        </div>
                    </motion.section>



                    {/* Section 2: Privacy Policy (গোপনীয়তা নীতি) */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm drop-shadow-sm md:p-10"
                    >
                        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                            <ShieldCheck className="h-6 w-6 text-blue-500" />
                            <h2 className="text-xl font-bold text-slate-800 md:text-2xl">গোপনীয়তা নীতি (Privacy Policy)</h2>
                        </div>
                        <div className="grid gap-5 md:grid-cols-3">
                            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                                <FileText className="mb-3 h-5 w-5 text-emerald-600" />
                                <h3 className="mb-2 font-bold text-slate-800">আপনার তথ্য আপনার সম্পদ</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">আমরা আপনার দেওয়া স্বাস্থ্য তথ্য এবং ব্যক্তিগত ডেটা শুধুমাত্র আপনাকে সঠিক চিকিৎসা পরামর্শ দেওয়ার জন্য ব্যবহার করি।</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                                <Lock className="mb-3 h-5 w-5 text-blue-600" />
                                <h3 className="mb-2 font-bold text-slate-800">নিরাপত্তা</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">আপনার ডেটা সম্পূর্ণ সুরক্ষিত এবং এন্ড-টু-এন্ড এনক্রিপ্টেড। আমরা সর্বোচ্চ ডেটা সিকিউরিটি স্ট্যান্ডার্ড মেনে চলি।</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                                <ShieldCheck className="mb-3 h-5 w-5 text-purple-600" />
                                <h3 className="mb-2 font-bold text-slate-800">তৃতীয় পক্ষ</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">আপনার অনুমতি ব্যতীত কোনো তৃতীয় পক্ষের সাথে আপনার ব্যক্তিগত তথ্য শেয়ার করা হয় না।</p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Section 3: Medical Disclaimer (চিকিৎসাবিষয়ক সতর্কতা) */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm md:p-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
                        <div className="flex items-start gap-4">
                            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="mb-2 text-lg font-bold text-amber-900">চিকিৎসাবিষয়ক সতর্কতা</h2>
                                <p className="text-sm leading-relaxed text-amber-800/80">
                                    'ডাক্তার সাব' একটি AI বা কৃত্রিম বুদ্ধিমত্তা চালিত প্রাথমিক স্বাস্থ্য পরামর্শ প্ল্যাটফর্ম। এখানে দেওয়া তথ্য ও পরামর্শ সাধারণ নির্দেশিকা হিসেবে কাজ করে এবং এটি কোনোভাবেই নিবন্ধিত বিশেষজ্ঞ ডাক্তারের সরাসরি চিকিৎসা, রোগ নির্ণয় বা জরুরি চিকিৎসার বিকল্প নয়। জরুরি স্বাস্থ্য ঝুঁকিতে অবিলম্বে নিকটস্থ হাসপাতাল বা চিকিৎসকের শরণাপন্ন হোন।
                                </p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Section 4: Contact Info (যোগাযোগ) */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm drop-shadow-sm md:p-10"
                    >
                        <h2 className="mb-6 text-xl font-bold text-slate-800">যোগাযোগ করুন</h2>
                        <div className="grid gap-6 sm:grid-cols-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-slate-400">ইমেইল</p>
                                    <p className="text-sm font-medium text-slate-800">support@doctorsab.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-slate-400">ফোন</p>
                                    <p className="text-sm font-medium text-slate-800">+8801822777035</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase text-slate-400">ঠিকানা</p>
                                    <p className="text-sm font-medium text-slate-800">ঢাকা, বাংলাদেশ</p>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Section: Powered By */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-8 shadow-sm relative mt-10 md:p-12 mb-8"
                    >
                        <div className="relative z-10 flex flex-col items-center justify-center text-center">
                            <p className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">Powered By</p>
                            <img src="/digiverse-logo.jpg" alt="Digiverse International" className="h-16 md:h-24 object-contain" />
                            <p className="mt-6 max-w-lg text-sm text-slate-500 leading-relaxed font-medium">
                                Shaping the future of health-tech through cutting-edge Artificial Intelligence and robust digital infrastructure.
                            </p>
                        </div>
                    </motion.section>

                </div>
            </div>
        </div>
    );
}
