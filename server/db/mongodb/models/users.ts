import mongoose, { Document, Model } from "mongoose";

export interface IUser extends Document {
  userName: string;
  email: string;
  password?: string;
  role?: 'admin' | 'user' | 'staff';
  address?: mongoose.Types.ObjectId;
  image?: string;
  authProviderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const userSchema = new mongoose.Schema<IUser>({
    userName: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String},
    role: { type: String, enum: ['admin', 'user', "staff"] },
    address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
    image: { type: String},
    authProviderId: { type: String},
  }, {timestamps: true});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('Users', userSchema);

export default User;

export const updateUserByID = async (
  id: string, 
  firstName: string, 
  lastName: string, 
  userName: string, 
  email: string, 
  password: string, 
  address: string, 
  image: string
) => {
    const encryptedPword = password;

    try {
        await User.updateOne(
            {_id: id},
            {
                firstName: firstName,
                lastName: lastName,
                userName: userName,
                email: email,
                password: encryptedPword,
                address: address,
                image: image,
            }
        );
    } catch (error) {
        console.log("error in updating user account", error);
    }
};

export const searchUsers = async (userName: string, email: string) => {
    try {
        const users = await User.find({ $and: [{userName: userName}, {email: email}]});
        return users;
    } catch (error) {
        console.log("unable to find user", error);
    }
};

export const findUsers = async (userName: string) => {
    try {
        const users = await User.find({userName: userName});
        return users;
    } catch (error) {
        console.log("unable to find user", error);
    }
};

export const usersAZ = async () => {
    try {
        const result = await User.find().sort({ userName: 1 }); //or -1 z-a
        return result;
    } catch (error) {
        console.log("unable to get all users alphabetically", error);
    }
};

export const totalUsers = async () => {
    try {
        const result = await User.find().countDocuments();
        return result;
    } catch (error) {
        console.log("unable to get total users", error);
    }
};

export const skipLimitUserList = async (start = 0, limit: number) => {
    try {
        const result = await User.find().skip(start).limit(limit);
        return result;
    } catch (error) {
        console.log(`unable to get users list of ${limit} limit`, error);
    }
};
