export interface Release {
  version: string;
  date: string;
  changes: { bn: string; en: string }[];
}

export const RELEASES: Release[] = [
  {
    version: "260.50.160",
    date: "১৬ মে, ২০২৬",
    changes: [
      { bn: "সাইট আইকন পরিবর্তন করা হয়েছে", en: "Site icon updated" },
      { bn: "ছোটখাটো কিছু বাগ ফিক্স করা হয়েছে", en: "Minor bug fixes" },
      { bn: "ডার্ক এবং লাইট থিম আলাদা করে ব্যবস্থাপনা করা হয়েছে", en: "Dark and light themes separated" },
    ],
  },
];

export const CURRENT_VERSION = RELEASES[0].version;
