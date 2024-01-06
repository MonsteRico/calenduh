import { Input } from "./ui/input";

// TODO pick a better color palette
const colors = [
    "#FF5733",
    "#C70039",
    "#900C3F",
    "#581845",
    "#1C2833",
    "#17202A",
    "#F4D03F",
    "#F7DC6F",
    "#52BE80",
    "#48C9B0",
];

export function CircleColorPicker({ color, onChange }: { color: string; onChange: (newColor: string) => void }) {
    return (
        <div style={{ backgroundColor: color }} className="flex flex-row flex-wrap gap-2 rounded border p-2">
            {colors.map((colorHex) => (
                <div
                    key={colorHex}
                    onClick={() => {
                        onChange(colorHex);
                    }}
                    style={{ backgroundColor: colorHex }}
                    className={`w-10 h-10 rounded-full cursor-pointer`}
                ></div>
            ))}
            <Input
                style={{ borderWidth: "4px", borderColor: color }}
                type="text"
                value={color}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
