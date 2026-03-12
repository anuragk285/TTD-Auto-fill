function fillForm(data) {
  const filledFields = [];
  
  if (data.general) {
    const generalFields = [
      { name: 'pilgrimEmail', value: data.general.pilgrimEmail },
      { name: 'pilgrimCity', value: data.general.pilgrimCity },
      { name: 'pilgrimState', value: data.general.pilgrimState },
      { name: 'pilgrimCountry', value: data.general.pilgrimCountry },
      { name: 'pilgrimPincode', value: data.general.pilgrimPincode }
    ];

    generalFields.forEach(field => {
      const input = document.querySelector(`input[name="${field.name}"]`);
      if (input && field.value) {
        setInputValue(input, field.value);
        filledFields.push(field.name);
      }
    });
  }

  if (data.pilgrims && data.pilgrims.length > 0) {
    const pilgrimCards = document.querySelectorAll('.pilDetails_mainContainer__HPFSL');
    
    data.pilgrims.forEach((pilgrim, index) => {
      const card = pilgrimCards[index];
      if (card) {
        const nameInput = card.querySelector('input[name="name"]');
        if (nameInput && pilgrim.name) {
          setInputValue(nameInput, pilgrim.name);
          filledFields.push(`pilgrim${index + 1}_name`);
        }

        const ageInput = card.querySelector('input[name="age"]');
        if (ageInput && pilgrim.age) {
          setInputValue(ageInput, pilgrim.age);
          filledFields.push(`pilgrim${index + 1}_age`);
        }

        if (pilgrim.gender) {
          const genderInput = card.querySelector('input[name="gender"]');
          if (genderInput) {
            setDropdownValue(genderInput, pilgrim.gender);
            filledFields.push(`pilgrim${index + 1}_gender`);
          }
        }

        if (pilgrim.idType) {
          const idTypeInput = card.querySelector('input[name="idType"]');
          if (idTypeInput) {
            setDropdownValue(idTypeInput, pilgrim.idType);
            filledFields.push(`pilgrim${index + 1}_idType`);
          }
        }

        if (pilgrim.idNumber) {
          const idNumberInput = card.querySelector('input[name="idNumber"]');
          if (idNumberInput && pilgrim.idNumber) {
            setInputValue(idNumberInput, pilgrim.idNumber);
            filledFields.push(`pilgrim${index + 1}_idNumber`);
          }
        }
      }
    });
  }

  return filledFields.length > 0;
}

function setInputValue(input, value) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  nativeInputValueSetter.call(input, value);
  
  const event = new Event('input', { bubbles: true });
  input.dispatchEvent(event);
  
  const changeEvent = new Event('change', { bubbles: true });
  input.dispatchEvent(changeEvent);
}

function setDropdownValue(input, value) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  nativeInputValueSetter.call(input, value);
  
  const event = new Event('mousedown', { bubbles: true });
  input.dispatchEvent(event);
  
  const changeEvent = new Event('change', { bubbles: true });
  input.dispatchEvent(changeEvent);
  
  const inputEvent = new Event('input', { bubbles: true });
  input.dispatchEvent(inputEvent);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fillForm') {
    const success = fillForm(message.data);
    sendResponse({ success: success, filled: success ? 'Form filled' : 'No fields found' });
  }
  return true;
});
