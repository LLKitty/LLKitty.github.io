---
title: STM32 时钟树入门与常见坑
date: 2024-05-20
tags: [STM32, 时钟, 基础]
excerpt: 从 HSE/HSI 到 PLL，梳理 STM32 时钟树配置与调参思路，并总结常见报错与不稳定原因。
---

# 总览

STM32 的系统时钟通常由 HSE/HSI/PLL 组合而来。建议流程：

1. 先确定系统时钟源（HSE/HSI/PLL），再反推外设时钟。
2. 根据主频调整 Flash 等待状态与电压范围。
3. 高频前请确认供电能力与温度条件。

```c
// 伪代码：配置 PLL
enable_hse();
wait_hse_ready();
config_pll(m, n, p, q);
switch_sysclk_to_pll();
```

## 常见坑

- HSE 频率与晶振参数不匹配，起振失败。
- PLL 输出不满足数据手册要求，导致不稳定。
- Flash wait states 配置不足，高频下跑飞。


