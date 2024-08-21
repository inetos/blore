# 详解 package-info.java

再给同学讲 Java 项目分层时，想找一个文件，在其中详细说明每个包的作用，突然想到 `package-info.java` 文件，该文件我也只在开源项目中看过到，公司内的项目几乎没见过 :joy: 

今天谈一下该文件的作用和应用场景.

## 创建

先说一下如何创建该文件，像创建 java 类创建的话，IDEA 会提示报错.

![img](/img/java_package_info_err.png)

可以通过如下方式创建

![img](/img/java_package_info_create.png)


## 包级别的文档

从 Java 5 开始，包级别的文档可以写到 `package-info.java` 文件中，格式为 javadoc，如下代码所示：

```java
/**
 * 该包提供消息推送功能，包括如下服务:
 * <ul>
 *   <li>MailService: 推送邮件</li>
 *   <li>WeChatService: 推送企业微信消息</li>
 * </ul>
 *
 * @author Ran Mai
 * @version v1 2024/8/21 19:18
 */
package com.acrops.furion.courier.service;
```

使用插件生成 javadoc 的文档，查看对应的包的文档，里面展示了包上的注释文档。

![img](/img/java_package_info_jdoc.png)

## 包级别的注解

对于一些注解是作用在包级别上的，也就是写在 `package-info.java`中，比如非空判断 `org.springframework.lang.NonNullFields`

```java
@NonNullApi
@NonNullFields
package com.acrops.furion.courier.service;

import org.springframework.lang.NonNullApi;
import org.springframework.lang.NonNullFields;
```

对应的声明为：

```java
@Target(ElementType.PACKAGE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Nonnull
@TypeQualifierDefault(ElementType.FIELD)
public @interface NonNullFields {
}
```

对应的注释描述为

> A common Spring annotation to declare that fields are to be considered as non-nullable by default for a given package.  
> Should be used at package level in association with Nullable annotations at field level.

翻译：该包下面的字段(field)都是非空的，如果想为空，需要在字段上标记 `@Nullable`. 

也就是包上面的注解，是对包中所有类/方法/字段生效的。

## 总结

`package-info.java`文件的核心功能，包括：

- 包级别的文档，描述包的作用
- 包级别的注解，可以应用到包下面的所有类

## 参考

- [java-package-info -- Baeldung](https://www.baeldung.com/java-package-info)
