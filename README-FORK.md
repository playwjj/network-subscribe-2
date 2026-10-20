# SubForge — fork 说明

本仓库是 [MiSub](https://github.com/imzyb/MiSub) 的 fork，在**完全保留上游功能**的基础上，
额外加入了上游没有的一个功能：**ClashParty 风格的 YAML 覆写（Override）**。

除此之外与上游一致。上游的功能、部署方式、使用说明请看仓库根目录的
[README.md](README.md) / [README-zh.md](README-zh.md)。

---

## 新增功能：YAML 覆写（Clash）

### 它解决什么问题

MiSub 生成的 Clash 配置里，分组、规则、DNS 等都由面板自动生成。如果想用
ClashParty / Mihomo Party 的 override 玩法（在最终配置上打一层自定义补丁），
上游没有这个入口。本 fork 补上了：

> 在 MiSub 生成好的 Clash 配置之上，再应用一层你写的 YAML 补丁。
> **补丁里没写到的部分，一律保持 MiSub 原样**——内置分组、规则、节点都不会被动。

### 在哪里设置

后台 → **设置** → **服务集成** → **「YAML 覆写（Clash）」**卡片，
把你的 override YAML 粘进去保存即可。下次拉取 Clash 订阅时自动生效。

留空 = 功能关闭，行为与上游 100% 一致。

### 合并语义（与 ClashParty override 一致）

| 写法 | 含义 |
|---|---|
| 普通 key（如 `dns:`） | 深度合并：对象递归合并，只覆盖你写到的字段 |
| `key!:` | 强制整体替换该 key 的整个值，不做合并 |
| `+key:` | 数组**前插**：你的条目加到原数组最前面（如 `+rules:`） |
| `key+:` | 数组**后加**：你的条目追加到原数组末尾 |
| `<+key>:` | 转义写法：key 本身以 `+` 开头时用它（如域名 key `<+.example.com>`） |

注意：普通 key 写数组会**整体替换**原数组；想保留原有规则/节点再追加，
请用 `+rules:` / `rules+:` 这类前后插写法。

### 示例

```yaml
# 深合并 DNS 设置，不影响 MiSub 的其他 DNS 项
dns:
  enable: true
  enhanced-mode: fake-ip
  nameserver:
    - https://dns.alidns.com/dns-query

# 在原有规则最前面插入自己的规则（MiSub 的规则全部保留）
+rules:
  - DOMAIN-SUFFIX,example.com,DIRECT
  - DOMAIN-KEYWORD,ads,REJECT

# 追加一个自己的策略组
+proxy-groups:
  - name: 我的分组
    type: select
    proxies:
      - DIRECT
```

### 适用范围

- ✅ Clash / Mihomo 输出（模板生成与内置生成两条路径均已接入）
- ❌ Sing-Box（JSON）、Surge / Loon（INI）输出暂不应用覆写

YAML 写错时**不会导致订阅失败**：解析失败会跳过覆写、原样输出 MiSub 的配置
（fail-open），最多就是覆写不生效。

### 实现

- 核心：`functions/modules/subscription/yaml-override.js`（深度合并实现）
- 接入点：Clash 输出的 `yaml.dump` 之前（render-clash.js / builtin-clash-generator.js）
- 设置项：`clashOverrideYaml`

---

## 与上游同步

本 fork 每天通过 GitHub Actions（`sync-upstream.yml`）以 **merge** 方式同步
上游 `imzyb/MiSub` 的更新。fork 的改动集中在独立新文件 + 上游文件的最小钩子，
合并冲突概率很低；本文件（README-FORK.md）为 fork 独有文件，上游同步永远不会动它。
