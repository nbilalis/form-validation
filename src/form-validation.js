export default class FormValidation {
  constructor(id, params = { }) {
    this.form = document.getElementById(id);
    this.params = params;

    this.form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const result = await this.validate();

      if (result) {
        event.target.submit();
      }
    });
  }

  async validate() {
    const total_errors = [];

    for (const input of this.form.querySelectorAll("input")) {
      const value = input.value.trim();
      const length = value.length;
      const dataset = input.dataset;

      let valid = true;

      const errors = [];

      if (dataset["required"]) {
        if (length === 0) {
          valid = false;
          errors.push({
            el: input,
            rule: "required",
            message: `Field '${input.name}' is required!`
          });
        }
      }

      if (length > 0 && dataset["minLength"]) {
        const minLength = dataset["minLength"] * 1;
        if (length < minLength) {
          valid = false;
          errors.push({
            el: input,
            rule: "min-length",
            message: `Field '${input.name}' should be at least ${minLength} characters long!`
          });
        }
      }

      if (length > 0 && dataset["maxLength"]) {
        const maxLength = dataset["maxLength"] * 1;
        if (length > maxLength) {
          valid = false;
          errors.push({
            el: input,
            rule: "max-length",
            message: `Field '${input.name}' should be at most ${maxLength} characters long!`
          });
        }
      }

      if (length && dataset["acceptedValuesUrl"]) {
        const url = dataset["acceptedValuesUrl"];

        try {
          const response = await fetch(url);
          const json = await response.json();
          const validValues = json.results.map((item) =>
            item.name.toLowerCase());

          if (!validValues.includes(value.toLowerCase())) {
            valid = false;
            errors.push({
              el: input,
              rule: "accepted-values-url",
              message: `Field '${input.name}' doesn't contain a valid value!`
            });
          }
        } catch (error) {
          alert('Cannot contact remote server at this point, please try later');
          console.error(error);
          valid = false;
        }
      }

      input.parentElement.classList.toggle(this.params.validClassName ?? 'valid', valid);
      input.parentElement.classList.toggle(this.params.invalidClassName ?? 'invalid', !valid);

      input.setAttribute('title', errors.map(e => e.message).join('\n'));

      total_errors.push(...errors);
    }

    console.log(total_errors);

    return total_errors.length === 0;
  }
}
