import { motion } from "framer-motion";
import { SignUp } from "../../components/auth/SignUp";
import { Link } from "react-router-dom";

export const SignUpPage = () => {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <img
        src="https://i.hizliresim.com/t7u9qaj.jpg"
        alt="Medieval background"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{
          filter: "brightness(0.4)",
        }}
      />
      <div className="text-center mb-8 relative z-10">
        <motion.h1
          className="text-4xl font-[MedievalSharp] text-[#FFD700] mb-2"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          KINGDOM of HARPOON
        </motion.h1>
        <motion.p
          className="text-[#DEB887] font-[MedievalSharp]"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Create your account
        </motion.p>
      </div>

      <motion.div
        className="relative z-10 w-[90%] md:w-[30%]"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <SignUp />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Link
          to="/signin"
          className="mt-4 inline-block text-[#DEB887] hover:text-[#FFD700] transition-colors font-[MedievalSharp] relative z-10"
        >
          Already have an account? Sign In
        </Link>
      </motion.div>
    </motion.div>
  );
};
