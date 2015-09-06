byte CMD_RESET[]                = { 0x56, 0x00, 0x26, 0x00 };
byte CMD_RESET_RETURN[]         = { 0x76, 0x00, 0x26, 0x00 };

byte CMD_PICTURE_RESET[]        = { 0x56, 0x00, 0x36, 0x01, 0x03 };
byte CMD_PICTURE_RESET_RETURN[] = { 0x76, 0x00, 0x36, 0x00, 0x00 };

byte CMD_SET_RES[]              = { 0x56, 0x00, 0x31, 0x05, 0x04,
                                    0x01, 0x00, 0x19, 0x00 };
byte CMD_SET_RES_RETURN[]       = { 0x76, 0x00, 0x31, 0x00, 0x00 };

byte CMD_TAKE_PIC[]             = { 0x56, 0x00, 0x36, 0x01,
                                    0x00
                                  };
byte CMD_TAKE_PIC_RETURN[]      = { 0x76, 0x00, 0x36, 0x00,
                                    0x00
                                  };

byte CMD_READ_LENGTH[]          = { 0x56, 0x00, 0x34, 0x01,
                                    0x00
                                  };
byte CMD_READ_LENGTH_RETURN[]   = { 0x76, 0x00, 0x34, 0x00,
                                    0x04, 0x00, 0x00
                                  };

byte CMD_READ_PICTURE[]         = { 0x56, 0x00, 0x32, 0x0C,
                                    0x00, 0x0A, 0x00, 0x00,
                                    0x00, 0x00, 0x00, 0x00,
                                    0xFF, 0xFF, 0x00, 0xFF
                                  };
byte PACKET_PACKER[]            = { 0x76, 0x00, 0x32, 0x00, 
                                    0x00 
                                  }; 
int END_HIGH_BYTE = 12;
int END_LOW_BYTE = 13;
int START_HIGH_BYTE = 8;
int START_LOW_BYTE = 9;

int PACKET_SIZE = 112;
int PACKET_PACKER_SIZE = 10;

byte response[200];
byte picture[100000];
int size = 0;
int len = 0;
bool ret;

void setup() {
  Serial.begin(115200);
  Serial1.begin(115200);
  
  delay(1000);
  ret = resetCmd();
}

void loop() {
  if(!ret) return;
  size = 0;

  ret = setResCmd();
  if(!ret) {
    Serial.println("Could not set resolution");
    return; 
  }
  
  ret = pictureResetCmd();
  if(!ret) {
    Serial.println("Could not reset picture");
    return;
  }
  
  
  ret = takePicture();
  if (!ret) {
    Serial.println("Could not take picture");
    return;
  }
  
  size = readPicLength();
  if (size <= 0) {
    Serial.println("Could not get length of picture");
    return;
  }
  
  Serial.println("Reading picture...");
  
  getPic(size);
  
  Serial.println("");
  //while (true);
}

int readPacket(int idx, int packetLen) {
  CMD_READ_PICTURE[START_HIGH_BYTE] = idx >> 8;
  CMD_READ_PICTURE[START_LOW_BYTE] = 0xFF & idx;  
  CMD_READ_PICTURE[END_HIGH_BYTE] = packetLen >> 8;
  CMD_READ_PICTURE[END_LOW_BYTE] = 0xFF & packetLen;
  
  //Serial.print("Start: "); Serial.print(idx, DEC); Serial.print(" End: "); Serial.println(idx + packetLen, DEC);
  
  Serial1.write(CMD_READ_PICTURE, sizeof(CMD_READ_PICTURE));
  
  while(Serial1.available() != (packetLen + PACKET_PACKER_SIZE));
  
  len = 0;
  // read header 0x76, 0x00, 0x32, 0x00, 0x00;
  for(int j=0; j < 5; j++) {
    //Serial.print(Serial1.read(), HEX);
    response[len++] = Serial1.read();
  }  
  // check to see if header is good
  bool valid = validate(PACKET_PACKER, response, sizeof(PACKET_PACKER));
  if(!valid) {
    Serial.println("Header not found");
    return -1; 
  }
  
  // read data
  for(int j=0; j < packetLen; j++) {
    int tmp = Serial1.read();
    //Serial.print(tmp, HEX);
    picture[idx++] = tmp; 
  }

  len = 0;
  // read footer 0x76, 0x00, 0x32, 0x00, 0x00;
  for(int j=0; j < 5; j++) {
    //Serial.print(Serial1.read(), HEX);
    response[len++] = Serial1.read();
  }  
  // check to see if header is good
  valid = validate(PACKET_PACKER, response, sizeof(PACKET_PACKER));
  if(!valid) {
    Serial.println("Header not found");
    return -1; 
  }
  
  Serial1.flush();
  //Serial.println("");
  return idx;
}

void getPic(long length) {
  int numPackets = length / PACKET_SIZE;
  int remainder = length % PACKET_SIZE;
  int readIdx = 0;
  
  // read full packets 
  for(int i=0; i < numPackets; i++) {
    int tmp = readPacket(readIdx, PACKET_SIZE);
    /*if(!checkPacket(readIdx, PACKET_SIZE)) {
      Serial.println("Packet check failure");
      return;
    }*/
    readIdx = tmp;
    if(readIdx == -1) return;
  }
  
  // read remainder
  if(remainder != 0) {
     int tmp = readPacket(readIdx, remainder);
     /*if(!checkPacket(readIdx, remainder)) {
       Serial.println("Packet check failure");
       return;
     }*/
     readIdx = tmp;
     if(readIdx == -1) return;
  }
  
  
  //Serial.print("Remainder: "); Serial.println(remainder, DEC);
  Serial.print("Total bytes read: "); Serial.println(readIdx, DEC);
}

int readPicLength() {
  Serial1.write(CMD_READ_LENGTH, sizeof(CMD_READ_LENGTH));
  delay(1000);
  len = 0;
  while (Serial1.available()) {
    response[len++] = Serial1.read();
  }

  bool valid = validate(CMD_READ_LENGTH_RETURN, response, sizeof(CMD_READ_LENGTH_RETURN));
  long picLength = response[len - 2];
  picLength = picLength << 8;
  picLength |= response[len - 1];
  flushReceive();

  if (valid) {
    Serial.print("Picture length: ");
    Serial.println(picLength, DEC);
    return picLength;
  } else {
    Serial.println("ERROR reading length");
    return false;
  }
}

bool takePicture() {
  Serial.println("Take picture command");
  return sendCmd(CMD_TAKE_PIC, sizeof(CMD_TAKE_PIC), CMD_TAKE_PIC_RETURN, sizeof(CMD_TAKE_PIC_RETURN));
}

bool pictureResetCmd() {
  Serial.println("Picture reset command");
  return sendCmd(CMD_PICTURE_RESET, sizeof(CMD_PICTURE_RESET), CMD_PICTURE_RESET_RETURN, sizeof(CMD_PICTURE_RESET_RETURN));
}

bool resetCmd() {
  Serial.println("Reset command");
  return sendCmd(CMD_RESET, sizeof(CMD_RESET), CMD_RESET_RETURN, sizeof(CMD_RESET_RETURN));
}

bool setResCmd() {
  Serial.println("Set resolution");
  return sendCmd(CMD_SET_RES, sizeof(CMD_SET_RES), CMD_SET_RES_RETURN, sizeof(CMD_SET_RES_RETURN));
}


bool sendCmd(byte cmd[], int cmd_len, byte resp[], int resp_len) {
  Serial1.write(cmd, cmd_len);
  len = 0;
  delay(1000);
  while( Serial1.available()) {
    int tmp = Serial1.read();
    //Serial.println(tmp, HEX);
    response[len++] = tmp;
  }
  bool valid = validate(resp, response, resp_len);
  flushReceive();
  if(valid) return true;
  else return false;
}

bool validate(byte first[], byte second[], int len) {
  for (int i = 0; i < len; i++) {
    if (first[i] != second[i]) return false;
  }
  return true;
}

void flushReceive() {
  while (Serial1.available()) {
    Serial1.read();
  }
  memset(response, 0, sizeof(response));
}

