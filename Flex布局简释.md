## 一个简单的Flex排列
Flex可分为 ```容器``` 和 ```子项``` 两个概念。
容器指代外层的包裹元素，子项为里面排列的元素。

![image](https://user-images.githubusercontent.com/70362312/169737510-17c8a122-f456-439b-85cc-38d2b51121b0.png)


## 实现上图排列的步骤

1. html<br />
```
<div>
   <div></div>
   <div></div>
   <div></div>
</div>
```

2. 外层div在样式中添加 ```dispaly:flex```<br />
  添加 dispaly:flex后，外层div变成了Flex容器，可以定义```容器属性```；<br />
  添加 dispaly:flex后，里层div变成了Flex子项，可以定义```子项属性```；<br />

```css
.a{
  display:flex;
}
<div class="a">
   <div></div>
   <div></div>
   <div></div>
</div>
```

3. 定义容器和子项的长宽以及margin，定义背景用来区分<br />
   最后得到上图中的排列方式<br />

```css
.a{
  display:flex;
  background-color: #9a86a4; //深紫色
}
.b{
  width：400px;
  height:100px;
  margin:30px;
  background-color: #e9d5da; //浅紫色
}
<div class="a">
   <div class="b"></div>
   <div class="b"></div>
   <div class="b"></div>
</div>
```

## 容器属性和子项属性
1. 容器属性（添加在容器的style中）
```
flex-direction
flex-wrap
flex-flow
justify-content
align-items
align-content
```
2. 子项属性（添加在子项的style中）
```
order
flex-grow
flex-shrink
flex-basis
flex
align-self
```
3. <a href="https://www.runoob.com/w3cnote/flex-grammar.html">点击熟悉属性<a/>
  
## 用Flex绘制下图的布局模式
  
![image](https://user-images.githubusercontent.com/70362312/169750987-e2275bb3-64a3-4f38-ae3f-c37bbf000065.png)
  
 ```
 <div className="content">
    <div className="item-header"></div>
     <div className="item-content">
       <div className="item-side"></div>
       <div className="item-right"></div>
    </div>
    <div className="item-footer"></div>
  </div>
 ```
 
```
.content {
    height: 500px;
    background-color: #9a86a4;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
}
.item-header {
    height: 30px;
    margin: 10px;
    background-color: #e9d5da;
    flex-grow: 0;
}
.item-content {
    //既做子项（content的子项），又做容器（side和right的容器）
    //子项属性
    flex-grow: 1;
    //容器属性
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
}
.item-side {
    width: 200px;
    margin: 10px;
    background-color: #e9d5da;
    flex-grow: 0;
}
.item-right {
    margin: 10px;
    background-color: #e9d5da;
    flex-grow: 1;
}
.item-footer {
    height: 30px;
    margin: 10px;
    background-color: #e9d5da;
    flex-grow: 0;
}
  ```
