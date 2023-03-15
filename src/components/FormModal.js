import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers';
import {
   FormControl,
   FormHelperText,
   InputLabel,
   MenuItem,
   Select,
   Stack,
} from '@mui/material';
import apiService from '../app/apiService';
import Joi from 'joi';
import moment from 'moment';

const initial_form = {
   Make: '',
   Model: '',
   Year: '',
   'Transmission Type': '',
   price: 0,
   currency: 'USD',
   Size: '',
   Vehicles: '',
};
const currencies = ['USD', 'EUR', 'BTC', 'JPY'];
const TransmissionType = [
   'MANUAL',
   'AUTOMATIC',
   'AUTOMATED_MANUAL',
   'DIRECT_DRIVE',
   'UNKNOWN',
];
const Vehicles = [
   '2dr Hatchback',
   '2dr SUV',
   '4dr Hatchback',
   '4dr SUV',
   'Cargo Minivan',
   'Cargo Van',
   'Convertible',
   'Convertible SUV',
   'Coupe',
   'Crew Cab Pickup',
   'Extended Cab Pickup',
   'Passenger Minivan',
   'Passenger Van',
   'Regular Cab Pickup',
   'Sedan',
   'Wagon',
];

const Size = ['Compact', 'Midsize', 'Large'];
export default function FormModal({
   open,
   handleClose,
   mode,
   selectedCar,
   modalKey,
   refreshData,
}) {
   const [form, setForm] = useState(initial_form);
   const [errors, setErrors] = useState({});
   const schema = Joi.object({
      Make: Joi.string().required(),
      Model: Joi.string().required(),
      Year: Joi.number()
         .integer()
         .min(1900)
         .max(new Date().getFullYear())
         .required(),
      TransmissionType: Joi.string()
         .valid(
            'MANUAL',
            'AUTOMATIC',
            'AUTOMATED_MANUAL',
            'DIRECT_DRIVE',
            'UNKNOWN',
         )
         .required(),
      Size: Joi.string().valid('Compact', 'Midsize', 'Large').required(),
      Vehicles: Joi.string().required(),
      price: Joi.number().integer().min(10).required(),
      currency: Joi.string().valid('USD', 'BTC', 'JPY', 'EUR').required(),
   }).options({ stripUnknown: true, abortEarly: false });

   const handleChange = (e) => {
      const { name, value } = e.target;
      setForm({ ...form, [name]: value });
   };

   const handleEdit = async (newForm) => {
      try {
         delete newForm.Make;
         console.log(newForm);
         await apiService.put(`/car/${selectedCar?._id}`, { ...newForm });
         refreshData();
      } catch (err) {
         console.log(err);
      }
   };
   const handleCreate = async (newForm) => {
      try {
         const res = await apiService.post('/car', { ...newForm });
         refreshData();
         setForm(initial_form);
         console.log(res);
      } catch (err) {
         console.log(err.message);
      }
   };
   const handleSubmit = () => {
      let convertForm = {
         ...form,
         TransmissionType: form['Transmission Type'],
      };
      const validate = schema.validate(convertForm);
      if (validate.error) {
         console.log(validate.error);
         const newErrors = {};
         validate.error.details.forEach(
            (item) => (newErrors[item.path[0]] = item.message),
         );
         setErrors(newErrors);
      } else {
         if (mode === 'create') {
            handleCreate(validate.value);
         } else {
            handleEdit(validate.value);
         }
         // handleClose();
      }
   };
   useEffect(() => {
      if (selectedCar?._id) {
         setErrors({});

         setForm({
            ...selectedCar,
            price: selectedCar.Price?.price || 0,
            currency: selectedCar.Price?.currency || '',
         });
      } else setForm(initial_form);
   }, [selectedCar]);

   return (
      <LocalizationProvider dateAdapter={AdapterDateFns} key={modalKey}>
         <Dialog
            open={open}
            onClose={() => {
               handleClose();
               setErrors({});
            }}
         >
            <DialogTitle>
               {mode === 'create' ? 'CREATE A NEW CAR' : 'EDIT CAR'}
            </DialogTitle>
            <DialogContent>
               <Stack spacing={2}>
                  <TextField
                     error={errors.Make}
                     helperText={errors.Make ? errors.Make : null}
                     value={form.Make}
                     autoFocus
                     margin='dense'
                     name='Make'
                     label='Make'
                     type='text'
                     fullWidth
                     disabled={mode === 'edit' ? true : false}
                     variant='standard'
                     onChange={handleChange}
                  />
                  <TextField
                     error={errors.Model}
                     helperText={errors.Model ? errors.Model : null}
                     value={form.Model}
                     onChange={handleChange}
                     autoFocus
                     margin='dense'
                     name='Model'
                     label='Model'
                     type='text'
                     fullWidth
                     variant='standard'
                  />
                  <FormControl
                     error={errors.TransmissionType}
                     variant='standard'
                     sx={{ m: 1, minWidth: 120 }}
                  >
                     <InputLabel id='transmission_type_label'>
                        Transmission Type
                     </InputLabel>
                     <Select
                        labelId='transmission_type_label'
                        name='Transmission Type'
                        value={form['Transmission Type']}
                        onChange={handleChange}
                        label='Transmission Type'
                     >
                        {TransmissionType.map((item) => (
                           <MenuItem value={item} key={item}>
                              {item}
                           </MenuItem>
                        ))}
                     </Select>
                     {errors.TransmissionType ? (
                        <FormHelperText>
                           {errors.TransmissionType}
                        </FormHelperText>
                     ) : null}
                  </FormControl>
                  <FormControl
                     error={errors.Size}
                     variant='standard'
                     sx={{ m: 1, minWidth: 120 }}
                  >
                     <InputLabel id='size-label'>Size</InputLabel>
                     <Select
                        labelId='size-label'
                        name='Size'
                        value={form.Size}
                        onChange={handleChange}
                        label='Size'
                     >
                        {Size.map((item) => (
                           <MenuItem value={item} key={item}>
                              {item}
                           </MenuItem>
                        ))}
                     </Select>
                     {errors.size ? (
                        <FormHelperText>{errors.size}</FormHelperText>
                     ) : null}
                  </FormControl>
                  <FormControl
                     error={errors.Vehicles}
                     variant='standard'
                     sx={{ m: 1, minWidth: 120 }}
                  >
                     <InputLabel id='Vehicles-label'>Vehicles</InputLabel>
                     <Select
                        labelId='Vehicles-label'
                        name='Vehicles'
                        value={form.Vehicles}
                        onChange={handleChange}
                        label='Vehicles'
                     >
                        {Vehicles.map((item) => (
                           <MenuItem value={item} key={item}>
                              {item}
                           </MenuItem>
                        ))}
                     </Select>
                     {errors.size ? (
                        <FormHelperText>{errors.size}</FormHelperText>
                     ) : null}
                  </FormControl>
                  <Stack direction='row' spacing={2}>
                     <DatePicker
                        views={['year']}
                        label='Year'
                        openTo={'year'}
                        value={moment(form.Year.toString()).format('YYYY')}
                        error={errors.Year}
                        onChange={(newValue) => {
                           setForm({
                              ...form,
                              Year: moment(newValue).year(),
                           });
                        }}
                        renderInput={(params) => (
                           <TextField
                              {...params}
                              helperText={errors.Year ? errors.Year : null}
                           />
                        )}
                     />

                     <TextField
                        value={form.price}
                        onChange={handleChange}
                        error={errors.Price}
                        helperText={errors?.price ? errors.price : null}
                        margin='dense'
                        name='price'
                        label='price'
                        type='number'
                        variant='standard'
                     />
                     <FormControl
                        error={errors?.currency}
                        variant='standard'
                        sx={{ m: 1, width: 60 }}
                     >
                        <InputLabel id='currency-label'>$</InputLabel>
                        <Select
                           labelId='currency-label'
                           name='currency'
                           value={form.currency}
                           onChange={handleChange}
                           label='$'
                        >
                           {currencies.map((item) => (
                              <MenuItem value={item} key={item}>
                                 {item}
                              </MenuItem>
                           ))}
                        </Select>
                        {errors?.currency ? (
                           <FormHelperText>{errors?.currency}</FormHelperText>
                        ) : null}
                     </FormControl>
                  </Stack>
               </Stack>
            </DialogContent>
            <DialogActions>
               <Button onClick={handleClose}>Cancel</Button>
               <Button onClick={handleSubmit}>
                  {mode === 'create' ? 'Create' : 'Save'}
               </Button>
            </DialogActions>
         </Dialog>
      </LocalizationProvider>
   );
}
