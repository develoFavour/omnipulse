"use client";

import { motion, AnimatePresence } from "framer-motion";

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

interface IntroCurtainProps {
  introComplete: boolean;
  introPhase: "logo" | "words" | "exit";
}

export function IntroCurtain({ introComplete, introPhase }: IntroCurtainProps) {
  return (
    <AnimatePresence>
      {!introComplete && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[200] bg-[#0e0f0c] flex items-center justify-center overflow-hidden"
          animate={introPhase === "exit" ? { opacity: 0 } : { opacity: 1 }}
          transition={introPhase === "exit" ? { duration: 0.6, ease: EASE_IN } : {}}
        >
          <div className="absolute inset-0 bg-[radial-gradient(#9fe870_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.04]" />
          <div className="relative z-10 text-center">
            <motion.div
              className="h-16 w-16 rounded-full bg-[#163300] border-2 border-[#9fe870]/40 flex items-center justify-center text-[#9fe870] font-black text-xl mx-auto"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: EASE_EXPO }}
            >
              OP
            </motion.div>
            <motion.div
              className="mt-4 text-2xl font-black text-white tracking-tight font-heading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: EASE_EXPO }}
            >
              OmniPulse<span className="text-[#9fe870]">.</span>
            </motion.div>
            <AnimatePresence>
              {introPhase !== "logo" && (
                <motion.p
                  className="mt-3 text-sm text-white/40 font-medium tracking-wide"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE_EXPO }}
                >
                  Omnichannel broadcast engine
                </motion.p>
              )}
            </AnimatePresence>
            <motion.div
              className="mt-8 mx-auto h-[2px] w-32 bg-white/10 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                className="h-full bg-[#9fe870] rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
