import React from "react";
import { FaTelegramPlane, FaWhatsapp, FaInstagram } from "react-icons/fa";
import { Send } from "lucide-react";

/**
 * Returns the correct platform SVG icon component for a given platform name.
 */
export function getPlatformIcon(platform: string): React.ReactElement {
  switch (platform) {
    case "telegram":
      return React.createElement(FaTelegramPlane, { className: "h-4 w-4 text-blue-400" });
    case "whatsapp":
      return React.createElement(FaWhatsapp, { className: "h-4 w-4 text-emerald-400" });
    case "instagram":
      return React.createElement(FaInstagram, { className: "h-4 w-4 text-fuchsia-400" });
    default:
      return React.createElement(Send, { className: "h-4 w-4 text-zinc-400" });
  }
}
