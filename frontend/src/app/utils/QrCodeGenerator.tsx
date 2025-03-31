import axios from "axios";
export async function  QrCodeGenerator({ value }: { value: string })  {
    const url =`https://api.qrserver.com/v1/create-qr-code/?data=${value}&size=100x100&format=svg`
    
 const response=await axios.get(url)
if (response.status != 200) {
        throw new Error("Failed to generate QR code");
    }
return response.data;


}