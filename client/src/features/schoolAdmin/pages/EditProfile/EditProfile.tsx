import {updateProfile} from "../../../../shared/services/profileService.ts";
import withProfileForm from "../../hoc/withProfileForm.tsx";

const EditProfile = withProfileForm(updateProfile, '/api/admin/profile');

export default EditProfile
