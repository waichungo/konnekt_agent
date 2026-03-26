import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { sleep } from './utils.js';


// const portName = '/dev/ttyUSB0'; // Example for Linux
// const baudRate = 9600; // Common default for modems



export async function listPorts() {
    let ports = await SerialPort.list()
    return ports;
}
export interface PortConfig {
    baudRate: number,
    onData?: ((data: string) => void | null),
    onError?: ((error: any) => void | null)
}
export async function initModem(portPath: string, config: PortConfig) {
    let port = new SerialPort({
        path: portPath,
        baudRate: config.baudRate,
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    try {

        port.on('open', () => {
            console.log('Serial Port Open');
            // Send an initial command to check communication (e.g., 'AT')
           
            port.write('AT+CNUM\r', (err) => {
                if (err) {
                    return console.log('Error on write: ', err.message);
                }
                console.log('AT command written');
            });
        });

        // Read data (modem responses) from the serial port
        parser.on('data', (data: string) => {
            console.log('Received data: ' + data);
            // You can add logic here to send subsequent commands based on responses
            if (data.includes('OK')) {
                // Example: Dial a number (using D for dial command) - for older dial-up modems
                // For modern GSM modems, this would involve different AT commands for data connection
                // port.write('ATD*99#\r'); 
            }
            config.onData?.(data);
        });

        // Handle errors
        port.on('error', (err) => {
            console.error('Error: ', err.message);
            config.onError?.(err);
            throw err
        });

    } catch (err) {
        if (port) {
            port.close();
            throw err
        }

    }
    await sleep(5000)
    return port
}
