import { Navbar } from "../(home)/_components/navbar";

const MarkettingLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-full dark:bg-[#1F1F1F] flex flex-col">
            <Navbar />
            <main className="h-full pt-40">
            {children}
            </main>
        </div>
    );
};

export default MarkettingLayout;