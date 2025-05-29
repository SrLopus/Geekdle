import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98
    },
    in: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    out: {
        opacity: 0,
        y: -20,
        scale: 0.98,
        transition: {
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

const itemVariants = {
    initial: { 
        opacity: 0, 
        y: 20,
        scale: 0.95,
        filter: "blur(5px)"
    },
    in: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    out: { 
        opacity: 0, 
        y: -20,
        scale: 0.95,
        filter: "blur(5px)",
        transition: {
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

export default function PageTransition({ children }) {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            className="w-full min-h-screen pt-16"
            style={{
                position: 'absolute',
                width: '100%',
                top: 0,
                left: 0
            }}
        >
            {children}
        </motion.div>
    );
} 