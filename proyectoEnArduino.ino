// MQTT - Version: Latest
#include <MQTT.h>
#include <MQTTClient.h>

#include <SPI.h>
#include <Ethernet.h>

int pinEcho = 2;
int pinTrig = 3;

byte mac[] = {0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED};
IPAddress ip(192, 168, 1, 150); //mi ip en caso no encuentre por dhcp
IPAddress myDns(192, 168, 1, 1); //mi dns en caso no encuentre por dhcp

EthernetClient ethernetClient;

MQTTClient client;

void connect() {
  Serial.print("connecting...");
  while (!client.connect("arduino", "walnutwizard685", "BFtQqKhs4CIftf3F",false)) {
    Serial.print("failed, rc=");
      Serial.print(client.returnCode());
      Serial.print(" last error=");
      Serial.println(client.lastError());
    delay(1000);
  }

  Serial.println("\nconnected!");

  client.subscribe("/estadoled");
  // client.unsubscribe("/hello");
}

void messageReceived(String &topic, String &payload) {
  Serial.println("incoming: " + topic + " - " + payload);
  if(topic == "/estadoled"){
    if (payload == "on"){
       digitalWrite (6, HIGH);
    }else{
      digitalWrite (6, LOW);
    }
  }
}

void setup() {

  Serial.begin(9600);
  while (!Serial) {;}

  inicializar_ethernetShield();
  delay(1000); //para que arranque correctamente el shield

  pinMode(pinTrig, OUTPUT);
  pinMode(pinEcho, INPUT);

  pinMode(6, OUTPUT); //pin del led

  client.begin("walnutwizard685.cloud.shiftr.io", 1883,ethernetClient);
  client.onMessage(messageReceived);

  connect();
}

unsigned int distanciaPrevia = 0;

void loop() {

  client.loop();

  if (!client.connected()) {
    connect();
  }
  digitalWrite(pinTrig, LOW);
  delayMicroseconds(10);
  digitalWrite(pinTrig, HIGH);
  delayMicroseconds(10);

  long pulseDuration = pulseIn(pinEcho, HIGH, 10000);
  int distancia = (int)(0.034 * pulseDuration / 2);

   if(distancia != distanciaPrevia){
    Serial.print("Distancia ");
    Serial.print(distancia);
    Serial.println(" cm");
    distanciaPrevia = distancia;
    client.publish("/ultrasonido", String(distancia));
  }

  delay(100);


}
/*
void httpRequest() {

  Serial.println("making GET request");

  long distancia = sonar.ping_cm();
  String url = "/arduino?ultra=";
    url = url + distancia;
  httpClient.get(url);

  // read the status code and body of the response
  int statusCode = httpClient.responseStatusCode();
  if(statusCode == 200){
    String response = httpClient.responseBody();

    StaticJsonDocument<32> doc;
    DeserializationError error = deserializeJson(doc, response);

    if (error) {
      Serial.print(F("deserializeJson() failed: "));
      Serial.println(error.f_str());
      return;
    }

      String estado = doc["estadoLed"];
      Serial.print("Response: ");
      Serial.println(response);
      Serial.print("estado del Led: ");
      Serial.println(estado);

      if(estado == "on"){
        digitalWrite (6, HIGH);
      }else{
        digitalWrite (6, LOW);
      }

  }


}*/

void inicializar_ethernetShield(){
  Serial.println("Iniciando DHCP client:");
  if (Ethernet.begin(mac) == 0) {
    Serial.println("Error al configurar Ethernet con DHCP");

    if (Ethernet.hardwareStatus() == EthernetNoHardware) {
      Serial.println("No se encontró Shield Ethernet");
      while (true) { delay(1); }
    }

    if (Ethernet.linkStatus() == LinkOFF) {
      Serial.println("Cable ethernet desconectado");
    }

    Ethernet.begin(mac, ip, myDns);
    Serial.print("IP estático: ");
    Serial.println(Ethernet.localIP());

  } else {
    Serial.print("IP por DHCP asignado: ");
    Serial.println(Ethernet.localIP());
  }
}