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
```c
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
```

### Arduino UART使用
```cpp
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
```

## 通信协议设计

### 数据包格式
```c
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
```

### 数据发送
```c
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
```

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
```c
void sendSensorData(float temperature, float humidity)
{
    uint8_t data[8];
    
    // 将浮点数转换为字节数组
    memcpy(data, &temperature, 4);
    memcpy(data + 4, &humidity, 4);
    
    sendPacket(data, 8);
}
```

## 总结
UART是一种简单可靠的通信协议，掌握其使用方法对于嵌入式开发非常重要。
