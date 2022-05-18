# 一个 React 项目多个 Layout
熟悉 React 的同学可能都知道，在单页应用 (SPA：single-page application) 项目中，默认只有一个入口文件。<br/>
为了更友好的 SEO 和首次页面渲染的效率，我们一般会选择服务端渲染（SSR：server side render）方案。<br/>
当下最流行的 SSR 方案莫过于 ```Next.js```。```Next.js ```可以让我们的 React 项目从页面纬度，近似看作有多个入口文件。<br/>
但是这些入口文件，仍然由 ```pages/_app.js``` 这个入口文件做分发的。<br/>

## 全局共享同一个 Header
通常我们的整站的页面会有统一的导航栏 ```<Header />``` 
自然我们会想到将这个组件，放到我们的 ```pages/_app.js``` 文件中，这样我们全站就都有了统一的 Header。

```jsx
/** /pages/PageA.jsx */
const PageA = () => (<h1>PageA</h1>);
export default PageA;
```
```jsx
/** /pages/PageB.jsx */
const PageB = () => (<h1>PageB</h1>);
export default PageB;
```
```jsx
/** /pages/_app.js */
import Header from "../components/Header";
const MyAPP = ({ Component, pageProps }) => {
  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  );
};
export default MyAPP;
```
简单的理解，就是我们在切换页面的时候，只有 _app.js 中的 ```<Component />``` 会发生变化，而 Header 并不会产生变化。

## 某些页面不想要 Header
因为并不是所有的页面都一定需要 Header（比如：登录页）。又或者设计同学想要针对特定页面的 Header 做定制（比如：首页）。此时我们要如何处理呢？

```jsx
/** /pages/_app.js */
import Header from "../components/Header";
import HeaderHome from "../components/HeaderHome";

const MyAPP = ({ Component, pageProps, router }) => {

  // 登录页不需要 Header
  if(router.pathname==="/login"){
    return <Component {...pageProps} />;
  }

  // 首页需要定制 Header
  if(router.pathname==="/"){
    return (
      <>
        <HeaderHome />
        <Component {...pageProps} />
      </>
    );
  }
  
  // 其它页面，使用默认的
  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  );
};
export default MyAPP;
```

可以看到目前如果要实现这个逻辑，就只能在 ```_app.js``` 里面基于路由去做兼容处理。

然而只有三个页面，我们就已经写了这么多的兼容逻辑，如果页面有几十上百个，这个复杂度可想而知。

那有没有一个方法是基于页面纬度去按需选择我们的 Header 的呢？

## 按需加载 Header
我们可以将 Header 绑定到页面组件的静态属性上，然后在我们的 app.js中基于这个静态属性去渲染对应的 Header。
```jsx
/** /pages/PageA.jsx */
import Header from "../components/Header";
const PageA = () => (<h1>PageA</h1>);
PageA.Header = Header;
export default PageA;
```
```jsx
/** /pages/PageB.jsx */
import Header from "../components/Header";
const PageB = () => (<h1>PageB</h1>);
PageB.Header = Header;
export default PageB;
```
```jsx
/** /pages/Login.jsx */
const Login = () => (<h1>Page Login</h1>);
// 登录页不需要 Header，不传即可
export default Login;
```
```jsx
/** /pages/Home.jsx */
import HeaderHome from "../components/HeaderHome";
const Home = () => (<h1>Page Home</h1>);
// 首页想要定制 Header 也是可以做到的
Home.Header = HeaderHome;
export default Home;
```
```jsx
/** /pages/_app.js */
const MyAPP = ({ Component, pageProps }) => {
  // 有 Header
  if(Component.Header){
    return (
    	<>
          <Component.Header />
          <Component {...pageProps} />
        </>
    );
  }
  // 没有就直接渲染
  return <Component {...pageProps} />;
};
export default MyAPP;
```

这样就可以自由且灵活的在页面组件中决定是否需要 Header 以及需要什么样的 Header。

并且使用相同 Header 的页面，Header 的生命周期和渲染是共享的。也就是说页面从 PageA 跳转到 PageB 时，Header 并不会重复渲染。

## 多级 Header 如何复用？
实际开发中，有的二级页面可能除开全局公用的 Header 之外，还会共享相同的导航 Nav。此时一个静态属性，明显不能满足需求。
这里可以考虑将这个静态属性转换成一个静态方法。

```jsx
/** /pages/PageA.jsx */
import Header from "../components/Header";
const PageA = () => (<h1>PageA</h1>);
PageA.getHeader = ()=> <Header/> ;
export default PageA;
```
```jsx
/** /pages/PageB.jsx */
import Header from "../components/Header";
import Nav from "../components/Nav";
const PageB = () => (<h1>PageB</h1>);
PageB.getHeader = ()=>(
  <>
    <Header />
    <Nav/>
  </>
);
export default PageB;
```
```jsx
/** /pages/_app.js */
const MyAPP = ({ Component, pageProps }) => {
  // 有 getHeader, 执行然后渲染
  if(typeof Component.getHeader === 'function'){
    return (
    	<>
          {Component.getHeader()}
          <Component {...pageProps} />
        </>
    );
  }
  // 没有就直接渲染
  return <Component {...pageProps} />;
};
export default MyAPP;
```
这样我们就可以更加灵活的应对各种复杂的 Header了，此时 PageB和PageA 中的 Header 依然是共享的状态和生命周期的。
注意：这个例子中，如果 PageB 中的 ```<Header/>``` 和 ```<Nav/>``` 交换了位置，两个页面中的 Header 会独立渲染。

## 命名优化 ( Header to Layout)
上面我们将 Nav 放到 getHeader 中可能还说得通。随着项目的推进，突然有一天老板说，来，我们全站可能还需要共用同一个 Footer。此时明显 Footer 放到 getHeader 里面不太合理。
也就是说一开始我们命名为 getHeader 是比较不方便拓展的，显然 ```withLayout``` 更加适合。

```jsx
/** /component/Layout.jsx */
import Header from "../components/Header";
import Footer from "../components/Footer";
const Layout = ({children}) => (
  <>
      <Header />
      {children}
      <Footer />
  </>
);
export default Layout;
```
```jsx
/** /pages/PageA.jsx */
import Layout from "../components/Layout";
const PageA = () => (<h1>PageA</h1>);
PageA.withLayout = (page)=> <Layout>{page}</Layout>;
export default PageA;
```
```jsx
/** /pages/PageB.jsx */
import Layout from "../components/Layout";
const PageB = () => (<h1>PageB</h1>);
PageB.withLayout = (page)=> <Layout>{page}</Layout>;
export default PageB;
```
```jsx
/** /pages/_app.js */
const MyAPP = ({ Component, pageProps }) => {
  // 有 getHeader, 执行然后渲染
  if(typeof Component.withLayout === 'function'){
    return Component.withLayout(<Component {...pageProps} />);
  }
  // 没有就直接渲染
  return <Component {...pageProps} />;
};
export default MyAPP;
```

之后不管老板说要在全局修改什么，我们都只需要在 <Layout /> 去做处理就可以了。

## 代码优化
到这一步，我们虽然满足了需求，但是代码离优雅还有一段距离。

因为我们把页面组件并不关心的逻辑，直接写进了每一个页面组件。不符合高内聚，低耦合的设计方针。此时需要做一点小小的优化。


```jsx
/** /component/Layout.jsx */
import Header from "../components/Header";
import Footer from "../components/Footer";

const Layout = ({children}) => (
  <>
      <Header />
      {children}
      <Footer />
  </>
);

const withLayout=(Component)=>{
  Component.withLayout = (page) => <Layout>{page}</Layout>;
  return Component;
};

export default Layout;

// 暴露统一的方法，外面直接使用，不用关心内部实现
export {withLayout};
```
```jsx
/** /pages/PageA.jsx */
import { withLayout } from "../components/Layout";
const PageA = () => (<h1>PageA</h1>);
export default withLayout(PageA);
复制代码
/** /pages/PageB.jsx */
import { withLayout } from "../components/Layout";
const PageB = () => (<h1>PageB</h1>);
export default withLayout(PageB);
```

我们将绑定 withLayout 的方法，内聚在了 Layout 组件中。这样在页面组件使用的时候，就可以完全不用关心 Layout 的内部实现逻辑！

## 遗留问题
之前我们有提到，我们有的页面，除了共享全局的 Header 之外，还会共享自己独立的二级导航。换到我们现有的方案又该如何实现呢？

```jsx
/** /component/LayoutAndNav.jsx */
import Layout from "../components/Layout";
import Nav from "../components/Nav";

const LayoutAndNav = ({children})=> <Layout><Nav/>{children}</Layout> 

const withLayoutAndNav= (Component)=>{
  Component.withLayout = (page) => <LayoutAndNav>{page}</LayoutAndNav>;
  return Component;
};

export default LayoutAndNav;

// 暴露统一的方法，外面直接使用，不用关心内部实现
export { withLayoutAndNav };
```
```jsx
/** /pages/PageA.jsx */
import { withLayout } from "../components/Layout";
const PageA = () => (<h1>PageA</h1>);
export default withLayout(PageA);
```
```jsx
/** /pages/PageB.jsx */
import { withLayoutAndNav } from "../components/LayoutAndNav";
const PageB = () => (<h1>PageB</h1>);
export default withLayoutAndNav(PageB);
```

其实非常的简单，我们只需要再创建一个 Layout 即可。

## End
到这里我们就能通过，创建多个 Layout 灵活且优雅的实现页面相同的部分共享状态与渲染，不同的部分独自维护。并且 Layout 彼此之间还可以相互的嵌套。

相关阅读：Persistent Layout Patterns in Next.js
