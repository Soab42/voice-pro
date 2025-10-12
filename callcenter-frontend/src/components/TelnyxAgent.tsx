"use client"; // Marks as a client component

import { useEffect } from "react";

export default function TelnyxAgent() {
  useEffect(() => {
    // Check if the script is already loaded to avoid duplicates
    if (
      !document.querySelector(
        'script[src="https://unpkg.com/@telnyx/ai-agent-widget"]'
      )
    ) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@telnyx/ai-agent-widget";
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        // Once the script loads, append the agent element to the body
        const agentElement = document.createElement("telnyx-ai-agent");
        agentElement.setAttribute(
          "agent-id",
          "assistant-6577b9ea-87a7-46fd-94e4-398723069524"
        );
        document.body.appendChild(agentElement);
        const button = document.getElementsByTagName("telnyx-ai-agent");
        console.log(button);
      };
    } else {
      // If script is already loaded, just add the agent
      // const agentElement = document.createElement("telnyx-ai-agent");
      // agentElement.setAttribute(
      //   "agent-id",
      //   "assistant-6577b9ea-87a7-46fd-94e4-398723069524"
      // );
      // agentElement.style.position = "fixed";
      // agentElement.style.left = "0";
      // agentElement.style.bottom = "0";
      // document.body.appendChild(agentElement);
    }
  }, []);

  return null; // This component doesn't render anything visible
}
