import userModel from "../models/userModel.js";
import {comparepassword, hashpassword} from "../helpers/authHelper.js";
import orderModel from "../models/orderModel.js";
import JWT from 'jsonwebtoken'
import { compare } from "bcrypt";
import { token } from "morgan";

//const {JWT} = jsonwebtoken;
export const registerController = async(req,res) => {
    try {
        const {name,email,password,phone,address,answere} =req.body
        //validation 
        if (!name){
            return res.send({message:'Name is required'})
        }
        if (!email){
            return res.send({message:'email is required'})
        }
        if (!password){
            return res.send({message:'password is required'})
        }
        if (!phone){
            return res.send({message:'phone is required'})
        }
        if (!address){
            return res.send({message:'address is required'})
        }
        if (!answere){
            return res.send({message:'answere is required'})
        }

        //check user
        const existinguser = await userModel.findOne({email})
        //existing user
        if(existinguser){
            return res.status(200).send({
                success: false,
                message:'Alredy register ',
            })
        }
        //register user
        const hashedpassword = await hashpassword(password) 
        //save
        const user = await new userModel({name,email,phone,address,password:hashedpassword, answere}).save();
        res.status(201).send({
            success:true,
            message: 'user Register Successfully',
            user,
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Error in Registeration',
            error
        });
    }
};

//POST LOGIN
export const loginController = async(req,res) => {
    try {
        const {email,password} = req.body
      
        //validation 
        if(!email || !password){
            return res.status(404).send({
                success:false,
                message:'Inavlid email or password'

            });
        }
     
        //check user
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(404).send({
                success:false,
                message:'Email is not registerd'
            });
        }
        const match = await comparepassword(password,user.password)
        if(!match){
            return res.status(200).send({
                success:false,
                message:'Invalid password'
            });
        }
        //Token
       
        const token = await JWT.sign({_id:user._id}, process.env.JWT_SECRET, {
            expiresIn:'1d',
        });
        res.status(200).send({
            success:true,
            message:'login successfully',
            user:{
                name:user.name,
                email:user.email,
                phone:user.phone,
                address:user.address,
                role: user.role,
            },
            token,

        });
    } catch (error) {
     console.log(error);
     res.status(500).send({
        success:false,
        message:'ERROR in login',
        error
     }) ;
    }
};

// forgotPasswordController
export const  forgotPasswordController = async (req,res) => {
    try{
       const { email, answere , newPassword } = req.body
       if(!email){
        res.status(400).send({message:'email is reqired'})
       }
       if(!answere){
        res.status(400).send({message:'answere is reqired'})
       }
       if(!newPassword){
        res.status(400).send({message:'New password is reqired'})
       }

       //check 
       const user = await userModel.findOne({email,answere})
    
       
       //validation
       if(!user){
        return res.status(404).send({
            success:false,
            message:'wrong Email or answere'
        })
       }

       const hashed = await hashpassword(newPassword)
       await userModel.findByIdAndUpdate(user._id,{password:hashed})
       res.status(200).send({
        success:true,
        message:'Password Reset Successfully',
       });

       
    } catch(error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'something went wrong',
            error
        })

    } 
};

//test controller
export const testController =(req,res) => {
    try {
  res.send('Protected Route');
} catch (errroe) {
    console.log(error);
    res.send({error});
}
};


//update prfole
export const updateProfileController = async (req, res) => {
    try {
      const { name, email, password, address, phone } = req.body;
      const user = await userModel.findById(req.user._id);
      //password
      if (password && password.length < 6) {
        return res.json({ error: "Passsword is required and 6 character long" });
      }
      const hashedPassword = password ? await hashpassword(password) : undefined;
      const updatedUser = await userModel.findByIdAndUpdate(
        req.user._id,
        {
          name: name || user.name,
          password: hashedPassword || user.password,
          phone: phone || user.phone,
          address: address || user.address,
        },
        { new: true }
      );
      res.status(200).send({
        success: true,
        message: "Profile Updated SUccessfully",
        updatedUser,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "Error WHile Update profile",
        error,
      });
    }
  };


  //orders
export const getOrdersController = async (req, res) => {
    try {
      const orders = await orderModel
        .find({ buyer: req.user._id })
        .populate("products", "-photo")
        .populate("buyer", "name");
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error WHile Geting Orders",
        error,
      });
    }
  };
  //orders
  export const getAllOrdersController = async (req, res) => {
    try {
      const orders = await orderModel
        .find({})
        .populate("products", "-photo")
        .populate("buyer", "name")
        .sort({ createdAt: "-1" });
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error WHile Geting Orders",
        error,
      });
    }
  };
  
