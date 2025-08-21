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
```cpp
#include <SoftwareSerial.h>
#include <DHT.h>
#include <ArduinoJson.h>
```

### 2. 定义引脚
```cpp
#define DHT_PIN 4
#define RELAY_PIN 5
#define ESP_RX 2
#define ESP_TX 3

SoftwareSerial esp8266(ESP_RX, ESP_TX);
DHT dht(DHT_PIN, DHT11);
```

### 3. 初始化函数
```cpp
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
```

### 4. 主循环
```cpp
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
```

### 5. 辅助函数
```cpp
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
```

## 服务器端实现
可以使用Node.js或Python Flask创建简单的Web服务器来接收和处理数据。

## 扩展功能
1. 添加更多传感器
2. 实现双向通信
3. 添加数据存储
4. 创建Web控制界面

## 总结
Arduino结合ESP8266可以快速构建物联网原型，是学习物联网技术的理想平台。
