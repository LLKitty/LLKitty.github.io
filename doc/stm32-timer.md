# STM32定时器应用详解

## 定时器概述
STM32F1系列包含多种定时器：
- **基本定时器**: TIM6、TIM7
- **通用定时器**: TIM2-TIM5
- **高级定时器**: TIM1、TIM8

## 基本定时器配置

### 时钟配置
```c
void Timer_Init(void)
{
    // 使能定时器时钟
    RCC->APB1ENR |= RCC_APB1ENR_TIM6EN;
    
    // 配置预分频器
    TIM6->PSC = 7199;  // 72MHz / 7200 = 10kHz
    
    // 配置自动重装值
    TIM6->ARR = 9999;  // 10kHz / 10000 = 1Hz
    
    // 使能定时器
    TIM6->CR1 |= TIM_CR1_CEN;
}
```

### 中断配置
```c
void Timer_Interrupt_Init(void)
{
    // 使能更新中断
    TIM6->DIER |= TIM_DIER_UIE;
    
    // 配置NVIC
    NVIC_SetPriority(TIM6_DAC_IRQn, 1);
    NVIC_EnableIRQ(TIM6_DAC_IRQn);
}

void TIM6_DAC_IRQHandler(void)
{
    if(TIM6->SR & TIM_SR_UIF)
    {
        TIM6->SR &= ~TIM_SR_UIF;
        LED_Toggle();
    }
}
```

## PWM输出配置
```c
void PWM_Init(void)
{
    // 使能GPIOA时钟
    RCC->APB2ENR |= RCC_APB2ENR_IOPAEN;
    
    // 配置PA0为复用推挽输出
    GPIOA->CRL &= ~(0xF << 0);
    GPIOA->CRL |= (0xB << 0);
    
    // 使能定时器2时钟
    RCC->APB1ENR |= RCC_APB1ENR_TIM2EN;
    
    // 配置定时器2
    TIM2->PSC = 71;    // 72MHz / 72 = 1MHz
    TIM2->ARR = 999;   // 1MHz / 1000 = 1kHz
    
    // 配置PWM模式
    TIM2->CCMR1 |= (0x6 << 4);  // PWM模式1
    TIM2->CCER |= TIM_CCER_CC1E;
    
    // 设置占空比
    TIM2->CCR1 = 500;  // 50%占空比
    
    // 使能定时器
    TIM2->CR1 |= TIM_CR1_CEN;
}
```

## 实际应用案例

### 呼吸灯效果
通过改变PWM占空比实现LED亮度渐变：
```c
void Breath_LED(void)
{
    static uint16_t brightness = 0;
    static int8_t direction = 1;
    
    if(direction == 1)
    {
        brightness++;
        if(brightness >= 1000)
            direction = -1;
    }
    else
    {
        brightness--;
        if(brightness == 0)
            direction = 1;
    }
    
    TIM2->CCR1 = brightness;
    delay_ms(5);
}
```

## 总结
定时器是STM32中非常重要的外设，掌握其使用方法对于嵌入式开发至关重要。
