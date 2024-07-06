// functions that will be used to santiize data from the front-end

export function sanitize(input, isEmail = false) {
    if (typeof input !== 'string') {
        return input;
    }
    // refined to specifically handle email inputs since sanitizing the @ symbol would causes issues
    if (isEmail) {
        return input.replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;')
                    .replace(/\//g, '&#x2F;')
                    .replace(/\\/g, '&#x5C;')
                    .replace(/`/g, '&#x60;')
                    .replace(/=/g, '&#x3D;');
    }
    return input.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/\//g, '&#x2F;')
                .replace(/\\/g, '&#x5C;')
                .replace(/`/g, '&#x60;')
                .replace(/=/g, '&#x3D;')
                .replace(/@/g, '&#64;')
                .replace(/\$/g, '&#36;')
                .replace(/%/g, '&#37;')
                .replace(/\+/g, '&#43;')
                .replace(/{/g, '&#123;')
                .replace(/}/g, '&#125;')
                .replace(/\[/g, '&#91;')
                .replace(/\]/g, '&#93;')
                .replace(/\(/g, '&#40;')
                .replace(/\)/g, '&#41;');
}
// Function to validate email format, checks if @ exists
export function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  }