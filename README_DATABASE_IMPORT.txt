========================================================
SS SEED SHOP - COMPLETE DATABASE BACKUP & SETUP GUIDE
========================================================

এই জিপ (ZIP) ফাইলে আপনার সম্পূর্ণ ডাটাবেজ রেডি করে দেওয়া হয়েছে।

ফাইল পরিচিতি:
-------------
1. ssseedshop_complete_database.sql (মেইন ফাইল - সবচেয়ে সহজ ও রেকমেন্ডেড)
   - এটি একটি কমপ্লিট ফাইল যাতে টেবিল স্ট্রাকচার (Schema) + সমস্ত ১৮২+ প্রোডাক্ট, ক্যাটাগরি, ট্যাগ, সেটিংস ও সুপার অ্যাডমিন একসাথে দেওয়া আছে।
   - cPanel phpMyAdmin-এ শুধু এই একটা ফাইল Import করলেই সবকিছু একসাথে চালু হয়ে যাবে।

2. schema.sql
   - শুধুমাত্র টেবিল তৈরির জন্য।

3. seed.sql
   - শুধুমাত্র ডেটা (Products, Admins, Settings ইত্যাদি)।

4. json_and_schemas/
   - ব্যাকআপ JSON ফাইলসমূহ।

cPanel phpMyAdmin-এ যেভাবে Import করবেন:
---------------------------------------
ধাপ ১: cPanel-এ লগইন করুন।
ধাপ ২: 'phpMyAdmin' অপশনে ক্লিক করুন।
ধাপ ৩: বাম পাশের মেনু থেকে ডাটাবেজ সিলেক্ট করুন: jjcceicf_ssseedshop
ধাপ ৪: উপরের 'Import' ট্যাবে ক্লিক করুন।
ধাপ ৫: 'Choose File'-এ ক্লিক করে 'ssseedshop_complete_database.sql' ফাইলটি সিলেক্ট করুন।
ধাপ ৬: নিচে থাকা 'Import' বা 'Go' বাটনে ক্লিক করুন।
(কয়েক সেকেন্ডের মধ্যে সব টেবিল ও ১৮২+ প্রোডাক্ট ইমপোর্ট হয়ে যাবে!)

সুপার অ্যাডমিন লগইন তথ্য:
------------------------
Email: ssseedshop220@gmail.com
Password: ssseedshop220

ডাটাবেজ কানেকশন তথ্য (api/.env):
-------------------------------
DB_HOST=localhost
DB_NAME=jjcceicf_ssseedshop
DB_USER=jjcceicf_ssseedshop
DB_PASS=8.GdFreD&XPEWzC.
DB_CHARSET=utf8mb4

কানেকশন চেক করার লিঙ্ক:
https://api.ssseedshop.com/cpanel_database_update.php
========================================================
