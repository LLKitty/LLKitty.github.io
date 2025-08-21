# STM32入门指南：从零开始学习

## STM32简介
STM32是意法半导体推出的32位ARM Cortex-M系列微控制器，广泛应用于工业控制、消费电子等领域。

## 开发环境搭建

### 1. 硬件准备
- STM32开发板
- ST-Link调试器
- USB数据线

### 2. 软件安装
- **STM32CubeIDE**: 官方集成开发环境
- **Keil MDK**: 第三方IDE
- **STM32CubeMX**: 图形化配置工具

## 第一个程序：LED闪烁

### 硬件连接
- LED连接到PA5引脚
- 通过限流电阻接地

### 代码实现
```c
#include "stm32f1xx.h"

int main(void)
{
    // 使能GPIOA时钟
    RCC->APB2ENR |= RCC_APB2ENR_IOPAEN;
    
    // 配置PA5为推挽输出
    GPIOA->CRL &= ~(0xF << (5 * 4));
    GPIOA->CRL |= (0x3 << (5 * 4));
    
    while(1)
    {
        // LED点亮
        GPIOA->BSRR = GPIO_BSRR_BS5;
        delay_ms(500);
        
        // LED熄灭
        GPIOA->BSRR = GPIO_BSRR_BR5;
        delay_ms(500);
    }
}
```

## 外设使用

### GPIO操作
```c
// 设置引脚为输出
void GPIO_Init_Output(GPIO_TypeDef* GPIOx, uint16_t GPIO_Pin)
{
    GPIOx->CRL &= ~(0xF << (GPIO_Pin * 4));
    GPIOx->CRL |= (0x3 << (GPIO_Pin * 4));
}

// 设置引脚为输入
void GPIO_Init_Input(GPIO_TypeDef* GPIOx, uint16_t GPIO_Pin)
{
    GPIOx->CRL &= ~(0xF << (GPIO_Pin * 4));
    GPIOx->CRL |= (0x8 << (GPIO_Pin * 4));
}
```

## 中断处理
```c
void EXTI15_10_IRQHandler(void)
{
    if(EXTI->PR & EXTI_PR_PR13)
    {
        // 清除中断标志
        EXTI->PR = EXTI_PR_PR13;
        
        // 处理中断事件
        LED_Toggle();
    }
}
```

## 总结
STM32学习需要循序渐进，从基础GPIO操作开始，逐步掌握各种外设的使用方法。
