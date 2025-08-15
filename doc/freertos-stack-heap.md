---
title: FreeRTOS 任务栈与堆大小选择
date: 2024-06-02
tags: [RTOS, FreeRTOS, 内存]
excerpt: 估算任务栈大小、heap_4/5 的适用场景，以及堆碎片的排查技巧。
---

# 原则

- 以调用深度与局部变量规模预估栈，再用运行时水位线验证。
- 尽量集中创建任务，减少碎片化；关键对象考虑静态分配。

```c
// 查看任务栈水位线
uxTaskGetStackHighWaterMark(NULL);
```

## 堆实现选择

- heap_4：平衡性能与碎片率，常用默认。
- heap_5：多区域堆，适合多段内存场景。


