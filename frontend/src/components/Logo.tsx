import logo from "@/assets/logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo = ({ size = "md", showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: "w-24",
    md: "w-40",
    lg: "w-56",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <img 
        src={logo} 
        alt="Auxillium - Aplicativo de Apoio Psicológico Anônimo" 
        className={`${sizeClasses[size]} h-auto`}
      />
    </div>
  );
};

export default Logo;
