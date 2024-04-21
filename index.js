const person = {
    firstName: "John",
    lastName: "Doe",
    age: 30,
    email: "john.doe@example.com"
};

Object.keys(person).forEach(key => {
    Object.defineProperty(person, key, {
        writable: false,
        configurable: false
    });
});

person.updateInfo = function (newInfo) {
    Object.keys(newInfo).forEach(key => {
        if (Object.getOwnPropertyDescriptor(this, key)) {
            throw new Error(`${key} property is read-only.`);
        }
        this[key] = newInfo[key];
    });
};

Object.defineProperty(person, 'address', {
    value: {},
    enumerable: false,
    configurable: false
});

// Task 2: Object Property Enumeration and Deletion
const product = {
    name: "Laptop",
    price: 1000,
    quantity: 5
};

Object.defineProperties(product, {
    price: { enumerable: false, writable: false },
    quantity: { enumerable: false, writable: false }
});

function getTotalPrice(product) {
    if (!product || typeof product !== 'object') {
        throw new Error('Invalid product object');
    }

    if (!product.hasOwnProperty('price') || !product.hasOwnProperty('quantity')) {
        throw new Error('Product object must have price and quantity properties');
    }

    if (typeof product.price !== 'number' || typeof product.quantity !== 'number' || product.price < 0 || product.quantity < 0) {
        throw new Error('Price and quantity must be positive numbers');
    }

    const priceDesc = Object.getOwnPropertyDescriptor(product, 'price');
    const quantityDesc = Object.getOwnPropertyDescriptor(product, 'quantity');
    return priceDesc.value * quantityDesc.value;
}

function deleteNonConfigurable(obj, propName) {
    if (!obj || typeof obj !== 'object') {
        throw new Error('Invalid object');
    }

    if (typeof propName !== 'string' || propName === '') {
        throw new Error('Property name must be a non-empty string');
    }

    const propDesc = Object.getOwnPropertyDescriptor(obj, propName);
    if (propDesc && !propDesc.configurable) {
        throw new Error(`${propName} property is non-configurable.`);
    }
    delete obj[propName];
}

// Task 3: Object Property Getters and Setters
const bankAccount = {
    _balance: 1000,
    get balance() {
        return this._balance;
    },
    set balance(amount) {
        this._balance = amount;
        this.formattedBalance = `$${amount}`;
    },
    formattedBalance: "$1000",
    transfer(targetAccount, amount) {
        if (!targetAccount || typeof targetAccount !== 'object') {
            throw new Error('Invalid target account');
        }
        if (typeof amount !== 'number' || amount <= 0) {
            throw new Error('Invalid transfer amount');
        }
        this.balance -= amount;
        targetAccount.balance += amount;
    }
};

// Task 4: Advanced Property Descriptors
function createImmutableObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        throw new Error('Input must be an object');
    }

    const immutableObj = {};
    Object.keys(obj).forEach(key => {
        const propDesc = Object.getOwnPropertyDescriptor(obj, key);
        if (propDesc.value !== null && typeof propDesc.value === 'object') {
            immutableObj[key] = createImmutableObject(propDesc.value);
        } else {
            Object.defineProperty(immutableObj, key, {
                value: obj[key],
                writable: false,
                configurable: false
            });
        }
    });
    return immutableObj;
}

const immutablePerson = createImmutableObject(person);

// Task 5: Object Observation
function observeObject(obj, callback) {
    if (typeof obj !== 'object' || obj === null) {
        throw new Error('First parameter must be an object');
    }
    if (typeof callback !== 'function') {
        throw new Error('Second parameter must be a function');
    }

    return new Proxy(obj, {
        get(target, prop) {
            callback(prop, 'get');
            return target[prop];
        },
        set(target, prop, value) {
            callback(prop, 'set');
            target[prop] = value;
            return true;
        }
    });
}

const observedPerson = observeObject(person, (prop, action) => {
    console.log(`Property '${prop}' was ${action} on the object.`);
});

// Task 6: Object Deep Cloning
function deepCloneObject(obj, cloned = new WeakMap()) {
    if (typeof obj !== 'object' || obj === null) {
        throw new Error('Argument must be an object or array');
    }
    if (!(cloned instanceof WeakMap)) {
        throw new Error('Second argument must be a WeakMap');
    }
    if (cloned.has(obj)) return cloned.get(obj);

    let clone;

    if (Array.isArray(obj)) {
        clone = [];
        cloned.set(obj, clone);
        obj.forEach((item, index) => {
            clone[index] = deepCloneObject(item, cloned);
        });
    } else if (typeof obj === 'object' && obj !== null) {
        clone = {};
        cloned.set(obj, clone);
        Object.keys(obj).forEach(key => {
            clone[key] = deepCloneObject(obj[key], cloned);
        });
    } else {
        clone = obj;
    }

    return clone;
}

// Task 7: Object Property Validation
function validateObject(obj, schema) {
    if (typeof obj !== 'object' || obj === null) {
        throw new Error('First argument must be an object');
    }

    if (typeof schema !== 'object' || schema === null) {
        throw new Error('Second argument must be an object');
    }
    
    return Object.keys(schema).every(key => {
        if (!obj.hasOwnProperty(key)) return false;

        const type = schema[key];
        const value = obj[key];

        if (typeof value !== type) return false;

        // Additional validation rules can be added here

        return true;
    });
}

const schema = {
    name: 'string',
    age: 'number',
    email: 'string'
};

const isValid = validateObject(person, schema);

console.log('Is person object valid?', isValid);