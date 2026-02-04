import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterDto {
  @IsEmail()
    email: string;
    
    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    @IsString()
    name: string;

  constructor(email:string,password:string,name:string){
    this.email=email;
    this.password=password;
    this.name=name;
  }
}
