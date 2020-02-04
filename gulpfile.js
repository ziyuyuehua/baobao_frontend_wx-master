/**
 * @Author whg
 * @Date 2019/7/12
 * @Desc
 */

let gulp = require("gulp");

gulp.task("beginMoego", gulp.series((cb) => {
    console.log("moego gulp begin");
    cb();
}));

let htmlmin = require("gulp-htmlmin");
let fileInline = require("gulp-file-inline");
gulp.task("htmlmin", gulp.series((cb) => {
    gulp.src("./build/web-mobile/*.html")
        .pipe(fileInline())
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true
        }))
        .pipe(gulp.dest("./build/web-mobile/")
            .on("end", cb));
}));

// let imagemin = require("gulp-imagemin");
// gulp.task("imagemin", function (cb) {
//     gulp.src(["./build/web-mobile/**/*.png"])
//         .pipe(imagemin([
//             imagemin.gifsicle({interlaced: true}),
//             imagemin.jpegtran({progressive: true}),
//             imagemin.optipng({optimizationLevel: 5})
//         ]))
//         .pipe(gulp.dest("./build/web-mobile/"))
//         .on("end", cb);
// });

// let tinypng = require("gulp-tinypng-nokey");
// gulp.task("tinypng", gulp.series(() => {
//     gulp.src("./build/web-mobile/**/*.png")
//         .pipe(tinypng())
//         .pipe(gulp.dest("./build/web-mobile/"))
//         .on("end", cb);
// }));

let tinypng = require("gulp-tinypng-compress");
gulp.task("tinypng", gulp.series((cb) => {
    gulp.src("./build/**/*.png")
        .pipe(tinypng({
            key: "Xj5vHkJYoGTzL8NIr0ccPYyei50oxtKv",
            // key: "YzXg3XD0rnFT7wZQjEiMrYCZX09TpcdX",
            sigFile: ".tinypng-sigs",
            sameDest: true,
            log: true,
            summarize: true,
            parallelMax: 10,
        }))
        .pipe(gulp.dest("./build/"))
        .on("end", cb);
}));

gulp.task("endMoego", gulp.series((cb) => {
    console.log("moego gulp end");
    cb();
}));

gulp.task("default", gulp.series(["beginMoego", "htmlmin", "endMoego"]));
gulp.task("online", gulp.series(["beginMoego", "htmlmin", "tinypng", "endMoego"]));