# blore

Java 职能提升宝库.

## 运行

运行前，请先确认已经安装相关的依赖.

- [Node.js v18.16.0+](https://nodejs.org/)
- 包管理器 [pnpm](https://pnpm.io/zh/)


1. 安装包依赖

```
pnpm install
```

2. 本地运行

```sh
pnpm docs:dev
```

运行成功后，点击 [http://localhosst:3000](http://localhost:3000) 访问页面.

3. 打包

```sh
pnpm docs:build
```

执行后，在项目根目录下，生成一个 `dist` 的文件夹，可以放在 nginx web 容器中运行.
