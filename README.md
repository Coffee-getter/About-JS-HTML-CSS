# sonny's logbook
注意点记录本，解题记录本

## sessionStroge 
`let info = sessionStorage.getItem('xxx')` 返回一个字符串 <br/>
所以 `info` 为string，`info.userID` 报错 <br/>
需要 `JSON.parse()` 才能获取属性 <br/>
