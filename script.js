// 文章数据
const articles = {
    // PCB设计相关文章
    pcb: [
        {
            title: "PCB设计基础：从原理图到制板",
            date: "2024-01-15",
            category: "PCB设计",
            content: `
# PCB设计基础：从原理图到制板

## 概述
PCB（Printed Circuit Board）印刷电路板是电子产品的重要组成部分，本文将介绍PCB设计的基本流程和注意事项。

## 设计流程

### 1. 原理图设计
原理图是PCB设计的第一步，需要：
- 选择合适的元器件
- 绘制电路连接关系
- 添加必要的标注和说明

### 2. PCB布局设计
布局设计需要考虑：
- 信号完整性
- 电磁兼容性
- 散热要求
- 机械结构

### 3. 布线设计
布线是PCB设计的核心：
- 信号线优先布线
- 电源线和地线要粗
- 高速信号需要考虑阻抗匹配

## 常用设计软件
- **Altium Designer**: 专业级PCB设计软件
- **KiCad**: 开源免费PCB设计软件
- **Eagle**: 适合中小型项目

## 设计注意事项
1. 元器件封装要准确
2. 考虑制造工艺要求
3. 预留测试点
4. 添加必要的标识

## 总结
PCB设计是一个系统工程，需要综合考虑电气性能、机械性能和制造工艺等多个方面。
            `
        },
        {
            title: "高速PCB设计中的阻抗控制",
            date: "2024-01-10",
            category: "PCB设计",
            content: `
# 高速PCB设计中的阻抗控制

## 阻抗控制的重要性
在高速数字电路中，信号完整性很大程度上取决于传输线的特性阻抗。

## 微带线阻抗计算
微带线的特性阻抗可以通过以下公式计算：

\`\`\`
Z0 = (87 / √(εr + 1.41)) × ln(5.98h / (0.8w + t))
\`\`\`

其中：
- Z0: 特性阻抗
- εr: 介电常数
- h: 介质层厚度
- w: 导线宽度
- t: 导线厚度

## 差分线设计
差分信号对需要：
- 保持一致的阻抗
- 控制线间距离
- 避免交叉和分支

## 实际应用案例
以STM32F407为例，其高速USB接口需要：
- 差分阻抗：90Ω ±10%
- 线宽：0.15mm
- 线间距：0.15mm
            `
        }
    ],
    
    // STM32相关文章
    stm32: [
        {
            title: "STM32入门指南：从零开始学习",
            date: "2024-01-20",
            category: "STM32",
            content: `
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
\`\`\`c
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
\`\`\`

## 外设使用

### GPIO操作
\`\`\`c
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
\`\`\`

## 中断处理
\`\`\`c
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
\`\`\`

## 总结
STM32学习需要循序渐进，从基础GPIO操作开始，逐步掌握各种外设的使用方法。
            `
        },
        {
            title: "STM32定时器应用详解",
            date: "2024-01-18",
            category: "STM32",
            content: `
# STM32定时器应用详解

## 定时器概述
STM32F1系列包含多种定时器：
- **基本定时器**: TIM6、TIM7
- **通用定时器**: TIM2-TIM5
- **高级定时器**: TIM1、TIM8

## 基本定时器配置

### 时钟配置
\`\`\`c
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
\`\`\`

### 中断配置
\`\`\`c
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
\`\`\`

## PWM输出配置
\`\`\`c
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
\`\`\`

## 实际应用案例

### 呼吸灯效果
通过改变PWM占空比实现LED亮度渐变：
\`\`\`c
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
\`\`\`

## 总结
定时器是STM32中非常重要的外设，掌握其使用方法对于嵌入式开发至关重要。
            `
        }
    ],
    
    // Arduino相关文章
    arduino: [
        {
            title: "Arduino物联网项目实战",
            date: "2024-01-12",
            category: "Arduino",
            content: `
# Arduino物联网项目实战

## 项目概述
本项目将使用Arduino UNO和ESP8266 WiFi模块构建一个简单的物联网系统，实现远程监控和控制。

## 硬件清单
- Arduino UNO R3
- ESP8266 WiFi模块
- DHT11温湿度传感器
- 继电器模块
- 面包板和连接线

## 电路连接

### ESP8266连接
- VCC → 3.3V
- GND → GND
- TX → Arduino D2
- RX → Arduino D3

### DHT11连接
- VCC → 5V
- GND → GND
- DATA → Arduino D4

### 继电器连接
- VCC → 5V
- GND → GND
- IN → Arduino D5

## 软件实现

### 1. 安装必要库
\`\`\`cpp
#include <SoftwareSerial.h>
#include <DHT.h>
#include <ArduinoJson.h>
\`\`\`

### 2. 定义引脚
\`\`\`cpp
#define DHT_PIN 4
#define RELAY_PIN 5
#define ESP_RX 2
#define ESP_TX 3

SoftwareSerial esp8266(ESP_RX, ESP_TX);
DHT dht(DHT_PIN, DHT11);
\`\`\`

### 3. 初始化函数
\`\`\`cpp
void setup() {
    Serial.begin(9600);
    esp8266.begin(115200);
    dht.begin();
    
    pinMode(RELAY_PIN, OUTPUT);
    digitalWrite(RELAY_PIN, LOW);
    
    // 配置ESP8266
    sendCommand("AT+RST", 2000);
    sendCommand("AT+CWMODE=1", 1000);
    sendCommand("AT+CWJAP=\"WiFi名称\",\"WiFi密码\"", 5000);
}
\`\`\`

### 4. 主循环
\`\`\`cpp
void loop() {
    // 读取传感器数据
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    
    // 创建JSON数据
    StaticJsonDocument<200> doc;
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["relay"] = digitalRead(RELAY_PIN);
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    // 发送数据到服务器
    sendData(jsonString);
    
    delay(5000);
}
\`\`\`

### 5. 辅助函数
\`\`\`cpp
void sendCommand(String command, int timeout) {
    esp8266.println(command);
    long int time = millis();
    while((time + timeout) > millis()) {
        while(esp8266.available()) {
            char c = esp8266.read();
            Serial.print(c);
        }
    }
}

void sendData(String data) {
    String cmd = "AT+CIPSTART=\"TCP\",\"服务器IP\",80";
    sendCommand(cmd, 1000);
    
    cmd = "POST /api/data HTTP/1.1\\r\\n";
    cmd += "Host: 服务器IP\\r\\n";
    cmd += "Content-Type: application/json\\r\\n";
    cmd += "Content-Length: " + String(data.length()) + "\\r\\n\\r\\n";
    cmd += data;
    
    sendCommand("AT+CIPSEND=" + String(cmd.length()), 1000);
    sendCommand(cmd, 1000);
}
\`\`\`

## 服务器端实现
可以使用Node.js或Python Flask创建简单的Web服务器来接收和处理数据。

## 扩展功能
1. 添加更多传感器
2. 实现双向通信
3. 添加数据存储
4. 创建Web控制界面

## 总结
Arduino结合ESP8266可以快速构建物联网原型，是学习物联网技术的理想平台。
            `
        }
    ],
    
    // 通信协议相关文章
    uart: [
        {
            title: "UART通信协议详解",
            date: "2024-01-08",
            category: "UART/串口",
            content: `
# UART通信协议详解

## UART简介
UART（Universal Asynchronous Receiver/Transmitter）是一种异步串行通信协议，广泛应用于微控制器之间的通信。

## 工作原理

### 异步通信特点
- 不需要时钟信号
- 发送方和接收方使用相同的波特率
- 通过起始位和停止位同步

### 数据帧格式
```
[空闲] [起始位] [数据位] [校验位] [停止位] [空闲]
  高     低       0-8位    可选     1-2位     高
```

## 硬件连接

### 基本连接
- TX → RX
- RX → TX
- GND → GND

### 电平转换
当连接不同电平的设备时，需要电平转换：
- 3.3V ↔ 5V: 使用电平转换芯片
- RS232 ↔ TTL: 使用MAX232等芯片

## 软件实现

### STM32 UART配置
\`\`\`c
void UART_Init(void)
{
    // 使能GPIOA和USART1时钟
    RCC->APB2ENR |= RCC_APB2ENR_IOPAEN | RCC_APB2ENR_USART1EN;
    
    // 配置PA9为USART1_TX
    GPIOA->CRH &= ~(0xF << 4);
    GPIOA->CRH |= (0x8 << 4);
    
    // 配置PA10为USART1_RX
    GPIOA->CRH &= ~(0xF << 8);
    GPIOA->CRH |= (0x8 << 8);
    
    // 配置USART1参数
    USART1->BRR = 0x1D4C;  // 72MHz / 115200 = 625
    
    // 使能发送和接收
    USART1->CR1 |= USART_CR1_TE | USART_CR1_RE | USART_CR1_UE;
}

// 发送一个字节
void UART_SendByte(uint8_t data)
{
    while(!(USART1->SR & USART_SR_TXE));
    USART1->DR = data;
}

// 接收一个字节
uint8_t UART_ReceiveByte(void)
{
    while(!(USART1->SR & USART_SR_RXNE));
    return USART1->DR;
}
\`\`\`

### Arduino UART使用
\`\`\`cpp
void setup() {
    Serial.begin(9600);
}

void loop() {
    if(Serial.available()) {
        char c = Serial.read();
        Serial.print("收到: ");
        Serial.println(c);
    }
}
\`\`\`

## 通信协议设计

### 数据包格式
\`\`\`c
typedef struct {
    uint8_t header[2];    // 包头 0xAA 0x55
    uint8_t length;       // 数据长度
    uint8_t data[32];     // 数据内容
    uint8_t checksum;     // 校验和
} UART_Packet_t;

uint8_t calculateChecksum(uint8_t *data, uint8_t length)
{
    uint8_t sum = 0;
    for(int i = 0; i < length; i++) {
        sum += data[i];
    }
    return sum;
}
\`\`\`

### 数据发送
\`\`\`c
void sendPacket(uint8_t *data, uint8_t length)
{
    UART_SendByte(0xAA);
    UART_SendByte(0x55);
    UART_SendByte(length);
    
    for(int i = 0; i < length; i++) {
        UART_SendByte(data[i]);
    }
    
    uint8_t checksum = calculateChecksum(data, length);
    UART_SendByte(checksum);
}
\`\`\`

## 常见问题与解决

### 1. 数据丢失
- 检查波特率设置
- 增加接收缓冲区
- 使用流控制

### 2. 数据错误
- 检查接线
- 添加校验位
- 使用更可靠的协议

### 3. 通信不稳定
- 检查电源质量
- 添加去耦电容
- 使用屏蔽线

## 实际应用案例

### 传感器数据采集
\`\`\`c
void sendSensorData(float temperature, float humidity)
{
    uint8_t data[8];
    
    // 将浮点数转换为字节数组
    memcpy(data, &temperature, 4);
    memcpy(data + 4, &humidity, 4);
    
    sendPacket(data, 8);
}
\`\`\`

## 总结
UART是一种简单可靠的通信协议，掌握其使用方法对于嵌入式开发非常重要。
            `
        }
    ]
};

// 分类描述
const categoryDescriptions = {
    pcb: "PCB设计技术分享，包括原理图设计、布局布线、制造工艺等",
    schematic: "电路原理图设计技巧和最佳实践",
    layout: "PCB布局布线设计方法和注意事项",
    stm32: "STM32单片机开发教程和项目案例",
    arduino: "Arduino开发平台应用和物联网项目",
    esp32: "ESP32开发板应用和WiFi项目",
    pic: "PIC单片机开发技术分享",
    rtos: "实时操作系统原理和应用",
    linux: "嵌入式Linux系统开发和移植",
    freertos: "FreeRTOS实时操作系统使用",
    uart: "串口通信协议和编程实现",
    i2c: "I2C总线协议和应用",
    spi: "SPI通信协议和编程",
    can: "CAN总线通信技术",
    temperature: "温度传感器应用和校准",
    pressure: "压力传感器应用技术",
    motion: "运动传感器和姿态检测",
    ide: "嵌入式开发环境配置",
    debug: "调试工具和技巧",
    simulation: "电路仿真和验证工具"
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    showWelcomeContent();
});

// 初始化导航
function initializeNavigation() {
    const categoryLinks = document.querySelectorAll('.category-group a');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            showCategory(category);
            
            // 更新活动状态
            categoryLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// 显示分类内容
function showCategory(category) {
    const currentCategoryEl = document.getElementById('current-category');
    const categoryDescriptionEl = document.getElementById('category-description');
    const articleContainer = document.getElementById('article-container');
    
    // 更新标题和描述
    currentCategoryEl.textContent = getCategoryTitle(category);
    categoryDescriptionEl.textContent = categoryDescriptions[category] || '该分类下的技术文章和教程';
    
    // 显示文章列表
    if (articles[category] && articles[category].length > 0) {
        displayArticles(category, articles[category]);
    } else {
        showNoArticles(category);
    }
}

// 获取分类标题
function getCategoryTitle(category) {
    const titles = {
        pcb: "PCB设计技术",
        schematic: "原理图设计",
        layout: "布局布线设计",
        stm32: "STM32开发技术",
        arduino: "Arduino应用开发",
        esp32: "ESP32开发技术",
        pic: "PIC单片机开发",
        rtos: "实时操作系统",
        linux: "嵌入式Linux",
        freertos: "FreeRTOS应用",
        uart: "UART串口通信",
        i2c: "I2C总线通信",
        spi: "SPI通信协议",
        can: "CAN总线技术",
        temperature: "温度传感器应用",
        pressure: "压力传感器技术",
        motion: "运动传感器应用",
        ide: "开发环境配置",
        debug: "调试工具技巧",
        simulation: "仿真验证工具"
    };
    
    return titles[category] || "技术文章";
}

// 显示文章列表
function displayArticles(category, articleList) {
    const articleContainer = document.getElementById('article-container');
    
    // 创建文章列表HTML
    let html = '<div class="article-list">';
    html += '<h3>文章列表</h3>';
    
    articleList.forEach((article, index) => {
        html += `
            <div class="article-item" onclick="showArticle('${category}', ${index})">
                <h4>${article.title}</h4>
                <div class="article-meta">
                    <span class="date">${article.date}</span>
                    <span class="category">${article.category}</span>
                </div>
                <p class="article-preview">${getArticlePreview(article.content)}</p>
            </div>
        `;
    });
    
    html += '</div>';
    articleContainer.innerHTML = html;
}

// 显示单篇文章
function showArticle(category, index) {
    const article = articles[category][index];
    const articleContainer = document.getElementById('article-container');
    
    // 使用模板创建文章
    const template = document.getElementById('article-template');
    const articleElement = template.content.cloneNode(true);
    
    // 填充文章内容
    articleElement.querySelector('.article-title').textContent = article.title;
    articleElement.querySelector('.article-date').textContent = article.date;
    articleElement.querySelector('.article-category').textContent = article.category;
    
    // 渲染Markdown内容
    const contentElement = articleElement.querySelector('.article-content');
    contentElement.innerHTML = marked.parse(article.content);
    
    // 代码高亮
    Prism.highlightAllUnder(contentElement);
    
    // 显示文章
    articleContainer.innerHTML = '';
    articleContainer.appendChild(articleElement);
    
    // 添加返回按钮
    addBackButton(category);
}

// 添加返回按钮
function addBackButton(category) {
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.innerHTML = '← 返回文章列表';
    backButton.onclick = () => showCategory(category);
    
    const articleContainer = document.getElementById('article-container');
    articleContainer.insertBefore(backButton, articleContainer.firstChild);
}

// 显示无文章提示
function showNoArticles(category) {
    const articleContainer = document.getElementById('article-container');
    articleContainer.innerHTML = `
        <div class="no-articles">
            <h3>暂无文章</h3>
            <p>该分类下暂时没有文章，敬请期待！</p>
            <p>你可以：</p>
            <ul>
                <li>查看其他分类的文章</li>
                <li>稍后再来访问</li>
                <li>联系作者投稿</li>
            </ul>
        </div>
    `;
}

// 显示欢迎内容
function showWelcomeContent() {
    // 默认显示欢迎内容，已在HTML中定义
}

// 获取文章预览
function getArticlePreview(content) {
    // 移除Markdown标记，获取纯文本
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = marked.parse(content);
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    // 返回前100个字符
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
}

// 添加CSS样式
const additionalStyles = `
    .article-list h3 {
        font-size: 24px;
        color: #2c3e50;
        margin-bottom: 25px;
        padding-bottom: 10px;
        border-bottom: 2px solid #e9ecef;
    }
    
    .article-item {
        background: white;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    
    .article-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        border-color: #667eea;
    }
    
    .article-item h4 {
        font-size: 20px;
        color: #2c3e50;
        margin-bottom: 10px;
        font-weight: 600;
    }
    
    .article-item .article-meta {
        display: flex;
        gap: 15px;
        margin-bottom: 15px;
        font-size: 14px;
        color: #6c757d;
    }
    
    .article-item .article-preview {
        color: #495057;
        line-height: 1.6;
        margin: 0;
    }
    
    .back-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        margin-bottom: 20px;
        transition: all 0.3s ease;
    }
    
    .back-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    
    .no-articles {
        text-align: center;
        padding: 60px 20px;
        color: #6c757d;
    }
    
    .no-articles h3 {
        font-size: 24px;
        color: #2c3e50;
        margin-bottom: 20px;
    }
    
    .no-articles ul {
        list-style: none;
        margin: 20px 0;
        padding: 0;
    }
    
    .no-articles li {
        padding: 8px 0;
        border-bottom: 1px solid #e9ecef;
    }
    
    .no-articles li:last-child {
        border-bottom: none;
    }
    
    .category-group a.active {
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
        transform: translateX(5px);
    }
`;

// 将样式添加到页面
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
