// src/components/EstadoPicker.tsx

const estados = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
    "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
    "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

type EstadoPickerProps = {
    value: string;
    onChange: (estado: string) => void;
    disabled?: boolean;
};

export default function EstadoPicker({ value, onChange, disabled }: EstadoPickerProps) {
    return (
        <div className="mb-4">
            <label htmlFor="estado-picker" className="block text-base mb-2 font-medium text-gray-800">
                Estado *
            </label>
            <select
                id="estado-picker"
                value={value}
                // O onChange do select nos dá um evento, pegamos o valor de e.target.value
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                // Classes do Tailwind para estilizar o <select> parecido com o app
                className="w-full p-4 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
                <option value="">Selecione o estado</option>
                {estados.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                ))}
            </select>
        </div>
    );
}