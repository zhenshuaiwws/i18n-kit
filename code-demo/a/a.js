class Book {
  constructor(x) {}
}

function i18nTranslate(a: any, b: any, c?: any) {
  console.log(a, b, c);

  return "";
}

const aa: any = i18nTranslate("common.ok", "确定1a");

const bb = {
  name: i18nTranslate("common.ok", "确定2a"),
};
const cc = [1, i18nTranslate("common.ok", "确定3a"), 2];

console.log(i18nTranslate("position.positionManage", "职位管理4a"));

console.log(i18nTranslate("position.positionManage", "职位{n}个5a", { n: 10 }));

console.log(
  i18nTranslate("position.positionManage", "职位{n}个6a", {
    n: 10,
  })
);

new Book({
  p: i18nTranslate("position.positionManage", "职位{n}个7a", {
    n: 10,
  }),
});

alert();
