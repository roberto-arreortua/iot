# IOT

En el curso se maneja en AWS paero yo lo hice de manera local 

## MQTT 

Es muy liviano, fue creado por IBM, se necesita un brocker, se pueden conectar a el dispositivos, apps etc. 

**Usa el metodo de:**
- Suscripción 
- Publicación 
*Nota: Se puede estar subscrito a más de un topico*


No se maneja la arquitectura esclavo maestro todos tienen la misma jerarquia, 
se suscriben  y publican haya o no más dispositivos conectados 

## Desacoplamiento Tridimensional 

- *Espacio* El publicador y subscriptor no se conocen 
- *Tiempo*  La información se resive no necesariamente en tiempo real 
- *Sincronización* No se necesita sincronización, puede hacer algo más en lo que resive el mensaje 

## Acciones 

- CONNECT 
- PUBLISH 
- SUBRCRIBE 
- UNSUSCRIBE 


## Topicos 

### FABRICA
            #############                #############
                    *temp*                      *temp*  
                    *hum*                       *hum*
            **Piso 2**                   **Piso 2**
Edificio    #############     Edificio   #############
   A        #############         B      ############# 
                    *temp*                      *temp*  
                    *hum*                        *hum*
            **Piso 1**                   **Piso 1** 
            #############                #############
            #############                #############
                    *temp*                      *temp*
                    *hum*                       *hum* 
                    *volt*                      *volt*
            **Piso PB**                  **Piso PB**        
            #############                #############
            
*Ejemplo:* Se tienen dos edificios con un dispositivo en cada piso con sesnsores de temp, hum y voltaje 

Se transmiten los datos en topicos 

`Publis: FABRICA/Edificio A/Piso 2/temp` -> envia 20 °
`Subs: FABRICA/Edificio A/Piso 2/temp` Temperatura del piso 2 = 20°

### **Comodin # es para obtener todo**

`Subs: FABRICA/Edificio A/Piso 2/#` Temperatura y humedad del piso 2
`Subs: FABRICA/Edificio A/#` Temperatura, humedad y voltaje(PB)  del todos los pisos del Edificio A

`Subs: FABRICA/#` Resiviremos toda la info de todos los sensores de todos los dispositivos

### **Comodin + mono nivel solo se puede usar una vez**

`Subs: FABRICA/+/Piso_2/temp` Resive la temp de los pios 2 de todos los edificios

## Calidad del Servicio (Quality of Service)

 Se manejan metodos de confirmación y redundancia, para que el mensaje les legue al menos una vez o solo una vez en el QOS 2 en caso de que resivir mas de una vez el mensaje cause problemas 

**QOS = 0** --> Confia en TCP
**QOS = 1** --> Al menos una vez
**QOS = 2** --> Solo una vez 

## Retención 
- Es un parametro (True) 
- El ultimo mensaje del publicador sera recibido cuando el suscriptor se conecte o cuando este conectado 
- Si no se tiene retención el mensaje se perdera para los dispositivos que no esten conectados o suscritos 

## Sesión persistente 
- Cuando me desconecte o no este presente todos los mensajes guardaran y enviaran cuando se conecte nuevamente 

## EMQX Brocker 
[Sitio web]('https://www.emqx.io/')

Se puede descargar para varios SO e incluso para Docker 

[Descarga]('https://www.emqx.io/downloads#broker')
Tmbien esciste Mosqquito, Mosca etc. 

### Contenedor Docker 
`docker pull emqx/emqx:4.3.5`  
`docker run -d --name emqx -p 1883:1883 -p 8081:8081 -p 8083:8083 -p 8084:8084 -p 8883:8883 -p 18083:18083 emqx/emqx:4.3.5`

Una vezl levantado el contenedor vamos a http://localhost:18083/#/login?redirect=%2F

y ahi vemos que esta la interface grafíca del login useranme:admin password: public

`docker exec -it emqx bash` para darle un vistazo al contenedor y controlar el brocker 

Entramos a **bin** y podemos escribir **./emqx stop** y se detendra el brocker y por lo tanto el contenedor 

En la carpeta **etc** esta el archivo **emqx** donde esta toda la config de los puertos

### Instalando en Ubuntu 

`wget https://www.emqx.io/downloads/broker/v4.3.5/emqx-ubuntu20.04-4.3.5-amd64.zip`

`unzip emqx-ubuntu20.04-4.3.5-amd64.zip` 

Correr `./emqx/bin/emqx start`

## Configuramos puertos 
En el archivo **nano etc/emqx.conf** editamos 
node.name = cerdomaldito@127.0.0.1
listener.ws.external = 8093 
listener.wss.external = 8094 

En el archivo **nano etc/plugins/emqx_management.conf** editamos 
management.listener.http = 8090


## Enviando y sersiviendo mensajes 

- Nos conectamos en Tools/Websocket cambiamso el Port a 8093, presionamos connect y subscribe 
- Revisar el Path
- Reviasr el topico al que estemos subscritos 
- El path y el topico debe colocarce en el cliente 

#### Cliente Mqtt 
npm install mqtt --save
Creamos el proyecto de la carpeta client
Para ejecutarlo `node clienteMqtt`

Revisamos la ruta en Tools/Websocket ws://localhost:8093/mqtt -> se puede cambiar en el campo Path ahí mismo

y el Topico al que nos vamos a conectar

Lo ejecutamos, y vamos al brocker a ver en Clients que se registra durante unos segundos y luego se desconecta

Se resivira el mensaje

## ACL MySql Authentication Access Control Plugin

- [Documentación]('https://docs.emqx.io/en/broker/v4.3/advanced/acl-mysql.html#mysql-connection-information')

- Instal plugin emqx_auth_mysql
- Tambien hay para Redis, Mongo DB y Postgres

- An external MySQL database is used to store ACL rules for MySQL ACL, which can store a large amount of data and dynamically manage ACLs for easy integration with external device management systems.


- Debemos crear una base de datos para autenticar los que ingresan a nuestros topicos 

- Para el desarrollo usamos un contenedor docker MySql 

### Creamos la tabla en la base de datos 
- Antes hay que crear la base de datos 

- Query Creaate Table : 

        CREATE TABLE `mqtt_user` (
          `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
          `username` varchar(100) DEFAULT NULL,
          `password` varchar(100) DEFAULT NULL,
          `salt` varchar(35) DEFAULT NULL,
          `is_superuser` tinyint (1) DEFAULT 0,
          `created` datetime DEFAULT NULL,
          PRIMARY KEY (`id`),
          UNIQUE KEY `mqtt_username` (`username`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


        CREATE TABLE `mqtt_acl` (
          `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
          `allow` int(1) DEFAULT 1 COMMENT '0: deny, 1: allow',
          `ipaddr` varchar(60) DEFAULT NULL COMMENT 'IpAddress',
          `username` varchar(100) DEFAULT NULL COMMENT 'Username',
          `clientid` varchar(100) DEFAULT NULL COMMENT 'ClientId',
          `access` int(2) NOT NULL COMMENT '1: subscribe, 2: publish, 3: pubsub',
          `topic` varchar(100) NOT NULL DEFAULT '' COMMENT 'Topic Filter',
          PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


- Insertamos datos en las tablas. Aqui vienen datos de los topicos **Creo que deberian de encryptarce algunso datos para eso es la salt, null es para que no este encryptado**


-- Client information
INSERT INTO db_iot.mqtt_user ( `username`, `password`, `salt`, `is_superuser`)
VALUES('emqx', '1234', NULL, 0); *No encrypte la pasword salt=Null*

-- All users cannot subscribe to system topics
INSERT INTO db_iot.mqtt_acl (allow, ipaddr, username, clientid, access, topic) VALUES (0, NULL, '$all', NULL, 1, '$SYS/#');

-- Allow clients on 10.59.1.100 to subscribe to system topics
INSERT INTO db_iot.mqtt_acl (allow, ipaddr, username, clientid, access, topic) VALUES (1, '10.59.1.100', NULL, NULL, 1, '$SYS/#');

-- Deny client to subscribe to the topic of /smarthome/+/temperature
INSERT INTO db_iot.mqtt_acl (allow, ipaddr, username, clientid, access, topic) VALUES (0, NULL, '$all', NULL, 1, '/smarthome/+/temperature');

-- Allow clients to subscribe to the topic of /smarthome/${clientid}/temperature with their own Client ID
INSERT INTO db_iot.mqtt_acl (allow, ipaddr, username, clientid, access, topic) VALUES (1, NULL, '$all', NULL, 1, '/smarthome/%c/temperature');

## Configurar plugin en Brocker 

- Vamos a etc/plugins `sudo nano emqx_auth_mysql.conf`
- Ahi configuramos:
0. Revisamos host de la base de datos y puerto 
1. Username 
2. password 
3. base de datos 
4. password_hash = plain para que no haga hash 

- Vamos a etc `nano emqx.conf`
1. allow_anonymous = false 

*Vamos al Brocker en Plugins buscamos emqx_auth_mysql Start y listo*

## Comprobando autenticación 

*Nota: Debemos recordar los usuarios y contraseñas que agregamos en MySql*
- Vamos al Brocker en Tool/Websockets intentamos conectarnos y no podremos hasta ingresar el usuario y contraseña correctos 

- Vamos al archivo clienteMqtt.js y de igual manera no podremos conectarnos hasta colocar las credenciales correctas en el objeto options





*******
   1
*******
Puertos que abrimos cuando creamos la instancia:
SSH 22
FTP 21
HTTP 80
HTTPS 443
VESTA 8083


*******
   2
*******
Comandos utilizados para instalar VESTA


# Descargar script de instalación
curl -O http://vestacp.com/pub/vst-install.sh

# Ejecutar instalación sin servidor de correos
bash vst-install.sh --nginx yes --apache yes --phpfpm no --named yes --remi yes --vsftpd yes --proftpd no --iptables yes --fail2ban yes --quota no --exim no --dovecot no --spamassassin no --clamav no --softaculous no --mysql yes --postgresql no --hostname cursoiot.ga --email somosioticos@gmail.com --password 121212



*******
3 para darle ssl al panel
*******
ln -s /home/username/conf/web/ssl.website.crt /usr/local/vesta/ssl/certificate.crt
ln -s /home/username/conf/web/ssl.website.key /usr/local/vesta/ssl/certificate.key


****
 4
****
Puertos a abrir tanto en firewall de vesta como en aws
1883,8883,8093,8094,8090,18083,8080

***
5
***
Descargar y descomprimir emqx
wget https://www.emqx.io/downloads/broker/v3.0.1/emqx-ubuntu18.04-v3.0.1.zip
unzip emqx-ubuntu18.04-v3.0.1.zip

ejecutar emqx
./bin/emqx start

tudominio:18083 para acceder al panel

*****
6 Para wss
****
ln -s /home/admin/conf/web/ssl.tudominio.crt /emqx/etc/certs/cert.pem
ln -s /home/admin/conf/web/ssl.tudominio.key /emqx/etc/certs/key.pem

****
7  Para forzar https y sin www crear archivo .htaccess con:
****

RewriteEngine on

RewriteCond %{HTTP_HOST} ^www\.(.*)$ [NC]
RewriteRule ^(.*)$ https://%1/$1 [R=301,L]

RewriteCond %{HTTPS} !on
RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]

***
8 INSTALAR NODEJS
***
sudo apt update
apt install nodejs
apt install npm

// para inicializar proyecto
npm init


****
9 PARA HACER MÁS COMODO EL DESARROLLO
****
//LINK
ln -s /home/admin/web/cursoiot.ga/public_html/node/index.js /home/ubuntu/index.js

//NODEMON
npm install -g nodemon

//pm2
npm install pm2 -g


****
11 PINOUT TFT ILI9341 -> ESP32
****

RC522		esp32 nodemcu
1 (VCC)		(VCC)
2 (GND)		GND
3 (CS)		5
4 (RESET)	4
5 DC		22
6 MOSI		23
7 SCK		18
8 LED		R22e -> 3,3V 
9 MISO		19
