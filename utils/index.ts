export const formatToIDRCurrency = (number: any) => {
    const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    });

    return formatter.format(number)?.replace(",00", "");
};

export const formatDateToIndonesian = (date: any) => {
    const newDate = new Date(date)
    const monthsInIndonesian = [
        'Januari', 'Februari', 'Maret', 'April',
        'Mei', 'Juni', 'Juli', 'Agustus',
        'September', 'Oktober', 'November', 'Desember'
    ];

    const month = monthsInIndonesian[newDate.getMonth()];
    const day = String(newDate.getDate()).padStart(2, '0');
    const year = newDate.getFullYear();

    return `${day} ${month} ${year}`;
};