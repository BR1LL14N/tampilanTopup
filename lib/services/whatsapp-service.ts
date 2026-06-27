import { SettingService } from "./setting-service";

export class WhatsappService {
  /**
   * Sends a general WhatsApp message using the active gateway configuration.
   */
  static async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      const isWaActive = await SettingService.get("wa_status", "disabled");
      if (isWaActive !== "enabled") {
        console.log("WhatsApp notifications are disabled by configuration.");
        return false;
      }

      const method = await SettingService.get("wa_method", "baileys");
      let endpoint = await SettingService.get("wa_endpoint", "http://localhost:5000/send");
      const token = await SettingService.get("wa_token", "");

      if (!to || !message) {
        console.error("WhatsApp Error: Target phone number or message is empty.");
        return false;
      }

      // Format target phone number (strip + and spaces)
      let targetPhone = to.replace(/[^0-9]/g, "");
      if (targetPhone.startsWith("0")) {
        targetPhone = "62" + targetPhone.substring(1);
      }

      let response;
      if (method === "fonnte") {
        // Fonnte API Spec
        const targetUrl = endpoint || "https://api.fonnte.com/send";
        console.log(`Sending WhatsApp message to ${targetPhone} via Fonnte Gateway...`);
        
        response = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token, // Fonnte uses the token directly in the Authorization header
          },
          body: JSON.stringify({
            target: targetPhone,
            message: message,
          }),
        });
      } else {
        // Default: Baileys Local Gateway Spec
        const targetUrl = endpoint || "http://localhost:5000/send";
        console.log(`Sending WhatsApp message to ${targetPhone} via Baileys Gateway (${targetUrl})...`);
        
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        response = await fetch(targetUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            to: targetPhone,
            message: message,
          }),
        });
      }

      const resData = await response.json();
      if (response.ok && (resData.success || resData.status)) {
        console.log(`WhatsApp message sent successfully to ${targetPhone}.`);
        return true;
      } else {
        console.error("WhatsApp API responded with an error:", resData);
        return false;
      }
    } catch (err) {
      console.error("Failed to send WhatsApp notification:", err);
      return false;
    }
  }

  /**
   * Formats and sends a checkout/invoice message to the customer and admin.
   */
  static async sendCheckoutNotification(transaction: any, product: any, game: any): Promise<void> {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mitsurushop.com";
      const paymentUrl = transaction.payment_url || `${siteUrl}/checkout/${transaction.id}`;
      const amountFormatted = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(transaction.amount);

      const customerMsg = `*MITSURU TOPUP HUB - TAGIHAN PEMBAYARAN* 📝

Halo Kak, pesanan top-up Anda telah kami terima dengan detail:
• *No. Invoice:* ${transaction.invoice}
• *Game:* ${game.name}
• *Produk:* ${product.name}
• *Target ID:* ${transaction.target_id} ${transaction.target_name ? `(${transaction.target_name})` : ""}
• *Total Bayar:* *${amountFormatted}*
• *Metode:* ${transaction.payment_method.toUpperCase()}

Silakan klik link di bawah ini untuk melakukan pembayaran:
👉 *${paymentUrl}*

_Catatan: Harap lakukan pembayaran sebelum batas waktu kadaluarsa. Pesanan Anda akan diproses otomatis setelah pembayaran lunas._

Terima kasih telah berbelanja di Mitsuru! 🎮`;

      const adminMsg = `*MITSURU TOPUP - NEW ORDER INCOMING* 🚨

Ada pesanan baru masuk!
• *Invoice:* ${transaction.invoice}
• *Game/Produk:* ${game.name} - ${product.name}
• *Target:* ${transaction.target_id} ${transaction.target_name ? `(${transaction.target_name})` : ""}
• *Total:* *${amountFormatted}*
• *Metode:* ${transaction.payment_method.toUpperCase()}
• *Status:* Pending (Menunggu Pembayaran)

Pantau transaksi di panel admin:
👉 *${siteUrl}/admin/transactions*`;

      // 1. Send notification to Customer if enabled
      const sendToCustomer = await SettingService.get("wa_customer_notif", true);
      if (sendToCustomer) {
        let recipientPhone = transaction.customer_phone;
        
        // Fallback to profile if customer_phone is empty and user is logged in
        if (!recipientPhone && transaction.user_id) {
          try {
            const { executeQuery } = await import("@/lib/db");
            const provider = process.env.DB_PROVIDER || "mysql";
            const table = provider === "supabase" ? "user_profiles" : "users";
            const profile = await executeQuery(`SELECT phone FROM ${table} WHERE id = $1 LIMIT 1`, [transaction.user_id]);
            if (profile && profile.length > 0 && profile[0].phone) {
              recipientPhone = profile[0].phone;
            }
          } catch (e) {
            console.error("Failed to fetch customer phone from profile:", e);
          }
        }

        if (recipientPhone) {
          await this.sendMessage(recipientPhone, customerMsg);
        }
      }

      // 2. Send notification to Admin if configured
      const adminPhone = await SettingService.get("wa_admin_number", "");
      if (adminPhone) {
        await this.sendMessage(adminPhone, adminMsg);
      }
    } catch (err) {
      console.error("Failed to format or send checkout WA notification:", err);
    }
  }

  /**
   * Formats and sends a payment success / order complete message.
   */
  static async sendSuccessNotification(transaction: any): Promise<void> {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mitsurushop.com";
      const amountFormatted = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(transaction.amount);
      
      // Fetch details
      const { executeQuery } = await import("@/lib/db");
      const details = await executeQuery(
        `SELECT p.name as product_name, g.name as game_name 
         FROM transactions t
         JOIN products p ON t.product_id = p.id
         JOIN games g ON p.game_id = g.id
         WHERE t.id = $1 LIMIT 1`,
        [transaction.id]
      );

      const productName = details.length > 0 ? details[0].product_name : "Produk Game";
      const gameName = details.length > 0 ? details[0].game_name : "Game";
      const sn = transaction.provider_ref || "-";

      const customerMsg = `*MITSURU TOPUP HUB - TRANSAKSI SELESAI* ✅

Halo Kak, pembayaran untuk transaksi Anda telah berhasil dikonfirmasi!
• *No. Invoice:* ${transaction.invoice}
• *Game:* ${gameName}
• *Produk:* ${productName}
• *Target ID:* ${transaction.target_id}
• *Status Top-Up:* *SUKSES (Berhasil)*
• *Serial Number (SN):* \`${sn}\`

Terima kasih banyak telah mempercayai Mitsuru. Ditunggu orderan berikutnya ya Kak! 🎮✨`;

      const adminMsg = `*MITSURU TOPUP - PESANAN SELESAI* 💰

Pembayaran LUNAS & Topup Sukses!
• *Invoice:* ${transaction.invoice}
• *Game/Produk:* ${gameName} - ${productName}
• *Target:* ${transaction.target_id}
• *Total:* *${amountFormatted}*
• *Status:* Sukses (Lunas)
• *SN:* \`${sn}\``;

      // 1. Send to Customer
      const sendToCustomer = await SettingService.get("wa_customer_notif", true);
      if (sendToCustomer) {
        let recipientPhone = transaction.customer_phone;
        
        // Fallback to profile
        if (!recipientPhone && transaction.user_id) {
          try {
            const provider = process.env.DB_PROVIDER || "mysql";
            const table = provider === "supabase" ? "user_profiles" : "users";
            const profile = await executeQuery(`SELECT phone FROM ${table} WHERE id = $1 LIMIT 1`, [transaction.user_id]);
            if (profile && profile.length > 0 && profile[0].phone) {
              recipientPhone = profile[0].phone;
            }
          } catch (e) {
            console.error("Failed to fetch customer phone from profile:", e);
          }
        }

        if (recipientPhone) {
          await this.sendMessage(recipientPhone, customerMsg);
        }
      }

      // 2. Send to Admin
      const adminPhone = await SettingService.get("wa_admin_number", "");
      if (adminPhone) {
        await this.sendMessage(adminPhone, adminMsg);
      }
    } catch (err) {
      console.error("Failed to format or send success WA notification:", err);
    }
  }
}
