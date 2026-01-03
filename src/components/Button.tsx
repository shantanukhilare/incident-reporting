import React from 'react';

const Button: React.FC<{ onClick: () => void; label: string; className?: string }> = ({ onClick, label, className }) => {
    return <button className={className} onClick={onClick}>{label}</button>;
}

export default Button;