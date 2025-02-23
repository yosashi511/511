
require('dotenv').config();
const { exec } = require('child_process');

console.log('🚀 جاري بدء تشغيل البوت...');

// تحديث الأوامر أولاً
exec('node deploy-commands.js', (error, stdout, stderr) => {
    if (error) {
        console.error('❌ حدث خطأ أثناء تحديث الأوامر:', error);
        console.error('stderr:', stderr);
        return;
    }
    console.log('✅ تم تحديث الأوامر بنجاح');
    console.log(stdout);
    
    // بعد تحديث الأوامر، قم بتشغيل البوت
    console.log('✨ جاري تشغيل البوت...');
    try {
        require('./index.js');
        console.log('✅ تم تشغيل البوت بنجاح');
    } catch (err) {
        console.error('❌ حدث خطأ أثناء تشغيل البوت:', err);
    }
});
