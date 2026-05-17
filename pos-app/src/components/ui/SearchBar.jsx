import { HiSearch } from 'react-icons/hi';
import Input from './Input';

export default function SearchBar({ value, onChange, placeholder = 'بحث...' }) {
  return (
    <Input
      icon={HiSearch}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
